import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon } from './schemas/coupon.schema';
import { COUPON_COLLECTION } from './coupon.constants';
import { CreateCouponI, UpdateCouponI } from './coupon.types';
import { randomCaseString } from 'make-random';
import { isEmpty } from 'class-validator';
import { User } from 'src/config/authorization/user.decorator';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';

const T = {
  couponNotFoupon: 'coupon is not found',
  couponUsed: 'coupon is not found or used',
  counsellorNotFound: 'counsellor is not found',
  expiredCoupon: 'this coupon has expired',
  duplicateFind: 'duplicate coupon found',
};

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(COUPON_COLLECTION) private readonly couponModel: Model<Coupon>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
  ) {}

  async findAllCoupons(user: User, limit: number, page: number) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin) {
      filter.ownedBy = user.user;
    }

    const totalDocs = await this.couponModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const couponsCheck = await this.couponModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: couponsCheck,
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

  async findSelectedCoupon(couponId: string): Promise<Coupon> {
    return await this.couponModel
      .findById(couponId)
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.debug(T.couponNotFoupon);
          throw new NotFoundException(T.couponNotFoupon);
        }
        return d;
      });
  }

  async createCoupon(user: User, requestCoupon: CreateCouponI) {
    let counsellorCheck: Counsellor;
    if (!user.isSuperAdmin && !user.isAdmin) {
      counsellorCheck = await this.counsellorModel
        .findOne({ userId: user.user })
        .lean()
        .then(async (d) => {
          if (isEmpty(d)) {
            Logger.warn(T.counsellorNotFound.toUpperCase());
            throw new NotFoundException(T.counsellorNotFound);
          }
          return d;
        });
    }

    const numberOfCoupons = requestCoupon.numberOfCoupons;
    const coupon = requestCoupon.couponDetails;

    if (numberOfCoupons <= 0) {
      Logger.debug('INVALID NUMBER OF COUPON');
      throw new BadRequestException(`Number of invalid coupons`);
    }

    let couponName: string = coupon.name;
    // check if the Coupon name is empty or undefined or not exactly 8 characters long
    while (isEmpty(coupon.name) || coupon.name?.length !== 8) {
      couponName = await randomCaseString(8);
      Logger.verbose(`COUPON NAME: ${couponName.toUpperCase()}`, 'Coupon');
      couponName = couponName;

      const couponCheck = await this.couponModel.findOne({
        name: couponName.toUpperCase(),
      });
      if (isEmpty(couponCheck)) {
        break;
      }
      Logger.warn(T.duplicateFind, 'Coupon');
    }

    const coupons = [];
    for (let i = 0; i < numberOfCoupons; i++) {
      coupons.push({
        ...coupon,
        name: couponName.toUpperCase(),
        ownedBy: counsellorCheck?.userId,
        createdBy: user.user,
      });
    }

    const createdCoupons = await this.couponModel.insertMany(coupons);

    return createdCoupons;
  }

  /**
   * update an existing coupon based on the provided data.
   * @param {string} couponId - ID of the coupon to update
   * @param {UpdateCouponDto} updateCouponDto - data used to update the coupon
   * @returns {Promise<Coupon>} promise that resolves to the updated coupon
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId
   * @throws {NotFoundException} throws if no coupon with the provided ID is found
   */
  async updateSelectedCoupon(
    couponId: string,
    coupon: UpdateCouponI,
  ): Promise<Coupon> {
    await this.findSelectedCoupon(couponId);

    const updatedCoupon = await this.couponModel
      .findByIdAndUpdate(
        couponId,
        { $set: coupon },
        { new: true, lean: true, upsert: true },
      )
      .lean();

    return updatedCoupon;
  }

  /**
   * remove a coupon from the database based on the provided ID
   * @param {string} couponId - ID of the coupon to remove
   * @returns {Promise<Coupon>} promise that resolves after the coupon is successfully removed
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId
   * @throws {NotFoundException} throws if no coupon with the provided ID is found
   */
  async deleteSelectedCoupon(couponId: string): Promise<Coupon> {
    await this.findSelectedCoupon(couponId);

    const deletedCoupon = await this.couponModel
      .findByIdAndDelete(couponId)
      .lean();
    return deletedCoupon;
  }

  async findByCouponName(couponName: string): Promise<Coupon> {
    const couponCheck = await this.couponModel
      .findOne({
        name: couponName.toUpperCase(),
        usedOn: undefined,
      })
      .lean();

    if (isEmpty(couponCheck)) {
      Logger.debug(T.couponNotFoupon);
      throw new BadRequestException(T.couponUsed);
    }

    return couponCheck;
  }

  async couponUse(couponName: string) {
    await this.findByCouponName(couponName).then(async (d) => {
      if (new Date(d.validThrough) < new Date()) {
        Logger.warn(T.expiredCoupon, 'Coupon');
        throw new BadRequestException(T.expiredCoupon);
      }
    });

    const updatedCoupon = await this.couponModel.findOneAndUpdate(
      { name: couponName },
      {
        $set: { usedOn: new Date() },
      },
      { new: true, lean: true },
    );

    return updatedCoupon;
  }
}
