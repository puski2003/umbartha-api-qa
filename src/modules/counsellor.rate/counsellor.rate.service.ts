import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { COUNSELLOR_RATE_COLLECTION } from './counsellor.rate.constants';
import { CounsellorRate } from './schema/counsellor.rate.schema';
import { Model, Types } from 'mongoose';
import { CreateRateI, UpdateRateI } from './counsellor.rate.types';
import { isEmpty, isNotEmpty } from 'class-validator';
import { User } from 'src/config/authorization/user.decorator';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { PaginatedObjI } from 'src/config/common/types/paginated-object.type';

const T = {
  counsellorRateNotFound: 'counsellor rate is not found',
  invalidTimeRange: 'start hour must be less than or equal to end hour',
  sameRate: 'counsellor has already define this rate',
  defaultRate: 'this is already default rate',
  counsellorNotFound: 'counsellor is not found',
  shouldHaveDefaultRate: 'counsellor should have a default rate',
  deleteCantDefaultRate: "counsellor default rate can't delete",
};

@Injectable()
export class CounsellorRateService {
  constructor(
    @InjectModel(COUNSELLOR_RATE_COLLECTION)
    private readonly rateModel: Model<CounsellorRate>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
  ) {}

  /**
   * Retrieves a paginated list of rates
   *
   * @param user
   * @param limit
   * @param page
   * @returns promise that resolves to a paginated containing rates
   */
  async findAllRates(user: User, limit = 50, page = 1): Promise<PaginatedObjI> {
    const filter: any = {};

    // /**
    //  * only allow super admins and admins to see all rates,
    //  * others see only their rates
    //  */
    // if (!user.isSuperAdmin && !user.isAdmin) filter.userId = user.user;

    if (
      !user.isSuperAdmin &&
      !user.isAdmin &&
      user.isCounsellor &&
      isNotEmpty(user.counsellor)
    )
      filter.counsellor = new Types.ObjectId(user.counsellor);

    /**
     * count total documents matching filter
     */
    const totalDocs = await this.rateModel.countDocuments(filter);

    /**
     * calculate total number of pages
     */
    const totalPages = Math.ceil(totalDocs / limit);

    /**
     * retrieve rates with pagination, sort, and population
     */
    const ratesCheck = await this.rateModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean()
      .populate([
        {
          path: 'counsellor',
          select: '_id profilePictureURL title displayName',
        },
      ]);

    return {
      docs: ratesCheck,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: limit,
        nextPage: page + 1,
        page: page,
        prevPage: page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  /**
   * Retrieve a rate by Id
   *
   * @param user
   * @param rateId
   * @returns promise tah resolves to rate if found, otherwise throws an exception
   */
  async findById(user: User, rateId: string) {
    const filter: any = {};

    /**
     * only allow super admins and admins to see all rates,
     * others see only their rates
     */
    if (!user.isSuperAdmin && !user.isAdmin) filter.userId = user.user;

    /**
     * Find the rate with the given ID
     */
    const rateCheck = await this.rateModel
      .findOne({ _id: rateId, ...filter })
      .lean()
      .populate([
        {
          path: 'counsellor',
          select: '_id profilePictureURL title displayName',
        },
        { path: 'service', select: 'name title' },
      ]);

    /**
     * If no rate is found, throw a NotFoundException
     */
    if (isEmpty(rateCheck))
      throw new NotFoundException(T.counsellorRateNotFound);

    return rateCheck;
  }

  /**
   * Creates a new rate for a counsellor
   *
   * @param user
   * @param rate
   * @returns promise that resolves to the created rate
   */
  async createRate(user: User, rate: CreateRateI): Promise<CounsellorRate> {
    /**
     * Check if the start hour is greater than or equal to the end hour
     */
    if (rate.hourFrom >= rate.hourTo) {
      throw new BadRequestException(T.invalidTimeRange);
    }

    /**
     * Find the counsellor based on user's role
     */
    const counsellorCheck = await this.counsellorModel
      .findOne(
        user.isSuperAdmin || user.isAdmin
          ? { _id: new Types.ObjectId(rate.counsellor) }
          : { userId: user.user },
      )
      .lean();

    /**
     * If no counsellor is found, throw an exceotion
     */
    if (isEmpty(counsellorCheck))
      throw new NotFoundException(T.counsellorNotFound);

    /**
     * Check if the same rate is already defined for the same counsellor
     */
    await this.rateModel
      .find({
        counsellor: new Types.ObjectId(counsellorCheck._id),
        ...(isNotEmpty(rate.service)
          ? { service: new Types.ObjectId(rate.service) }
          : { $or: [{ service: { $exists: false } }, { service: null }] }),
        currency: rate.currency,
        country: rate.country,
        nationality: rate.nationality,
        hourFrom: rate.hourFrom,
        hourTo: rate.hourTo,
        rate: rate.rate,
      })
      .then(async (d) => {
        if (isNotEmpty(d[0])) throw new BadRequestException(T.sameRate);
      });

    /**
     * Find records with the specified counsellor Id and defaultRate set to true
     */
    await this.rateModel
      .find({
        counsellor: new Types.ObjectId(counsellorCheck._id),
        ...(isNotEmpty(rate.service)
          ? { service: new Types.ObjectId(rate.service) }
          : {}),
        hourFrom: rate.hourFrom,
        hourTo: rate.hourTo,
        defaultRate: true,
      })
      .then(async (rates) => {
        /**
         * If no default rate exists and new rate is not set as default,
         * throw an exception
         */
        if (isEmpty(rates[0]) && !rate.defaultRate)
          throw new BadRequestException(T.shouldHaveDefaultRate);

        /**
         * if the new rate is set as default, update existing default rates to false
         */
        if (rate.defaultRate)
          await Promise.all(
            rates.map(async (rate) => {
              await this.rateModel.findByIdAndUpdate(
                rate._id,
                { $set: { defaultRate: false } },
                { new: true, lean: true },
              );
            }),
          );
      });

    /**
     * Create  the new rate
     */
    const createdRate = await this.rateModel.create({
      ...rate,
      counsellor: new Types.ObjectId(counsellorCheck._id),
      ...(isNotEmpty(rate.service)
        ? { service: new Types.ObjectId(rate.service) }
        : {}),
      userId: counsellorCheck.userId,
      createdBy: user.user,
    });

    return createdRate;
  }

  /**
   * Updates the selected rate for a counsellor
   *
   * @param user
   * @param rateId
   * @param rate
   * @returns promise thet resolves to the updated rate
   */
  async updateSelectedRate(user: User, rateId: string, rate: UpdateRateI) {
    const filter: any = {};

    /**
     * only allow super admins and admins to see all rates,
     * others see only their rates
     */
    if (!user.isSuperAdmin && !user.isAdmin) filter.userId = user.user;

    /**
     * Find the rate by Id and filter
     */
    const rateCheck = await this.rateModel.findOne({ _id: rateId, ...filter });

    /**
     * if not rate id found, throw an exception
     */
    if (isEmpty(rateCheck))
      throw new NotFoundException(T.counsellorRateNotFound);

    /**
     * Prevent changing the default rate status if it is already set
     */
    if (rateCheck.defaultRate && !rate.defaultRate)
      throw new BadRequestException('you can not change the default rate');

    /**
     * Check for duplicate rates with the same details
     */
    await this.rateModel
      .find({
        counsellor: new Types.ObjectId(rateCheck.counsellor),
        currency: rate.currency,
        country: rate.country,
        nationality: rate.nationality,
        hourFrom: rateCheck.hourFrom,
        hourTo: rateCheck.hourTo,
        rate: rate.rate,
        defaultRate: rateCheck.defaultRate,
        ...(rateCheck.service
          ? { service: new Types.ObjectId(rateCheck.service.toString()) }
          : { $or: [{ service: { $exists: false } }, { service: null }] }),
      })
      .lean()
      .then(async (d) => {
        await Promise.all(
          d.map(async (d) => {
            if (isNotEmpty(d) && d._id.toString() !== rateId)
              throw new BadRequestException(T.sameRate);
          }),
        );
      });

    /**
     * Validate time range for the rate
     */
    if (
      isNotEmpty(rate.hourFrom) &&
      isNotEmpty(rate.hourTo) &&
      rate.hourTo <= rate.hourFrom
    ) {
      throw new BadRequestException(T.invalidTimeRange);
    } else if (
      (isNotEmpty(rate.hourFrom) && rate.hourFrom >= rateCheck.hourTo) ||
      (isNotEmpty(rate.hourTo) && rate.hourTo <= rateCheck.hourFrom)
    ) {
      throw new BadRequestException(T.invalidTimeRange);
    }

    /**
     * If setting a new default rate, unset existing default rates
     */
    if (isNotEmpty(rate.defaultRate) && rate.defaultRate) {
      Logger.debug('CHECKING DEFAULT RATES');

      await this.rateModel
        .find({
          counsellor: new Types.ObjectId(rateCheck.counsellor),
          hourFrom: rateCheck.hourFrom,
          hourTo: rateCheck.hourTo,
          defaultRate: true,
          ...(isNotEmpty(rateCheck.service)
            ? { service: new Types.ObjectId(rateCheck.service._id) }
            : {}),
        })
        .lean()
        .then(async (d) => {
          await Promise.all(
            d.map(async (rate) => {
              await this.rateModel.findByIdAndUpdate(
                rate._id,
                { $set: { defaultRate: false } },
                { new: true, lean: true },
              );
            }),
          );
        });
    }

    /**
     * Update the rate with the provided date
     */
    const updatedRate = await this.rateModel
      .findByIdAndUpdate(
        rateId,
        {
          ...rate,
        },
        { new: true, upsert: true, lean: true },
      )
      .lean();

    return updatedRate;
  }

  /**
   * Deletes the selected rate for a counsellor
   *
   * @param user
   * @param rateId
   * @returns promise that resolves ro the deleted rate
   */
  async deleteSelectedRate(user: User, rateId: string) {
    const filter: any = {};

    /**
     * only allow super admins and admins to see all rates,
     * others see only their rates
     */
    if (!user.isSuperAdmin && !user.isAdmin) filter.userId = user.user;

    /**
     * Check if the rate is a default rate, prevent deletion if it is
     */
    await this.rateModel
      .findOne({ _id: rateId, defaultRate: true, ...filter })
      .then(async (rate) => {
        if (isNotEmpty(rate))
          throw new BadRequestException(T.deleteCantDefaultRate);
      });

    /**
     * Delete the rate by Id
     */
    const deletedRate = await this.rateModel.findByIdAndDelete(rateId).lean();

    return deletedRate;
  }

  /**
   * Changes the default rate for a counsellor rate
   *
   * @param user
   * @param rateId
   * @returns prommise that resolves to the updated rate
   */
  // async changeDefaultRate(user: User, rateId: string) {
  //   const filter: any = {};

  //   /**
  //    * only allow super admins and admins to see all rates,
  //    * others see only their rates
  //    */
  //   if (!user.isSuperAdmin && !user.isAdmin) filter.userId = user.user;

  //   const rateCheck = await this.rateModel.findById(rateId);

  //   /**
  //    * Check if the rate is already a default rate
  //    */
  //   if (rateCheck.defaultRate) {
  //     throw new BadRequestException(T.defaultRate);
  //   }

  //   /**
  //    * if not default, update to default and unset other default rates for
  //    * the same counsellor adn time range
  //    */
  //   if (rateCheck.defaultRate) {
  //     await this.rateModel
  //       .find({
  //         counsellor: rateCheck.counsellor,
  //         hourFrom: rateCheck.hourFrom,
  //         hourTo: rateCheck.hourTo,
  //         defaultRate: true,
  //       })
  //       .lean()
  //       .then(async (rates) => {
  //         Logger.warn('CHECKING DEFAULT RATES');

  //         await Promise.all(
  //           rates.map(async (rate) => {
  //             await this.rateModel.findByIdAndUpdate(
  //               rate._id,
  //               { $set: { defaultRate: false } },
  //               { new: true, lean: true },
  //             );
  //           }),
  //         );
  //       });
  //   }

  //   /**
  //    * Toggle the defaultRate flag for the rate identified by rateId
  //    */
  //   return await this.rateModel.findByIdAndUpdate(
  //     rateId,
  //     {
  //       $set: { defaultRate: !rateCheck.defaultRate },
  //     },
  //     { new: true, lean: true },
  //   );
  // }
}
