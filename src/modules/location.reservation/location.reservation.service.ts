import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LOCATION_RESERVATION_COLLECTION } from './location.reservation.constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LocationService } from '../location/location.service';
import {
  LocationReservation,
  ReservationTypes,
} from './schema/location.reservation.schema';
import { User } from 'src/config/authorization/user.decorator';
import { isEmpty, isNotEmpty } from 'class-validator';
import {
  CreateForDayReservationI,
  CreateReservationI,
  ReservationI,
  UpdateReservationI,
} from './location.reservation.types';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';

const T = {
  reservationNotFound: 'location reservation is not found',
  counsellorNotFound: 'counsellor is not found',
  alreadyReserved: 'location is already reverved',
  ivalidTimeRange: 'time range provided is invalid',
};

@Injectable()
export class LocationReservationService {
  constructor(
    @InjectModel(LOCATION_RESERVATION_COLLECTION)
    private readonly reservationModel: Model<LocationReservation>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    private readonly locationService: LocationService,
  ) {}

  async findAll(
    search: string,
    query: any,
    user: User,
    limit: number,
    page: number,
  ) {
    const pipeline = [];

    // Conditionally add a $match stage based on user roles
    if (!(user.isSuperAdmin || user.isAdmin)) {
      pipeline.push({ $match: { ownedBy: user.user } });
    }

    pipeline.push(
      /**
       * Stage 1: Lookup to join with reservation collection
       */
      {
        $lookup: {
          from: 'counsellors',
          let: { counsellorId: '$counsellor' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$counsellorId'] },
                // Add additional filters here if needed
              },
            },
            {
              $project: {
                _id: 1, // Include the _id field
                title: 1, // Include the title field
                displayName: 1, // Include the displayName field
              },
            },
          ],
          as: 'counsellor',
        },
      },
      /**
       * Stage 2: Unwind the counsellor array, keeping documents with no match
       */
      {
        $unwind: {
          path: '$counsellor',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    pipeline.push(
      /**
       * Stage 1: Lookup to join with reservation collection
       */
      {
        $lookup: {
          from: 'locations',
          let: { locationId: '$location' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$locationId'] },
              },
            },
            {
              $project: {
                _id: 1, // Include the _id field
                name: 1,
              },
            },
          ],
          as: 'location',
        },
      },
      /**
       * Stage 2: Unwind the location array, keeping documents with no match
       */
      {
        $unwind: {
          path: '$location',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    const filter = {};
    // Check if the search string is not empty
    if (isNotEmpty(search)) {
      // Split the search string by ':'
      const parts = search.split(':');

      // Extract the last part as the value
      const value = parts.pop();

      // Construct the key path for the filter without the last part
      const keyPath = parts.join('.');

      // Escape special characters in the value for use in regex
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Add the constructed filter to the filter object
      filter[keyPath] = { $regex: escapedValue, $options: 'i' };
    }

    // Add the $match stage to the pipeline if there are filters
    if (Object.keys(filter).length > 0) {
      pipeline.push({
        $match: filter,
      });
    }

    if (isNotEmpty(query.reserveFrom)) {
      pipeline.push({
        $match: {
          reserveFrom: { $gte: new Date(query.reserveFrom) },
        },
      });
    }

    if (isNotEmpty(query.reserveTo)) {
      pipeline.push({
        $match: {
          reserveTo: { $lte: new Date(query.reserveTo) },
        },
      });
    }

    const totalDocs = (await this.reservationModel.aggregate(pipeline)).length;
    const totalPages = Math.ceil(totalDocs / limit);

    // Add other stages to the pipeline
    pipeline.push(
      { $sort: { reserveFrom: -1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    );

    const reservationsCheck = await this.reservationModel.aggregate(pipeline);

    return {
      docs: reservationsCheck,
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

  async findSelectedReservation(reservationId: string) {
    const reservationCheck = await this.reservationModel
      .findById(reservationId)
      .lean()
      .populate([
        {
          path: 'counsellor',
          select: '_id profilePictureURL title displayName',
        },
        { path: 'location', select: '_id name' },
      ]);

    if (isEmpty(reservationCheck)) {
      throw new NotFoundException(T.reservationNotFound);
    }

    return reservationCheck;
  }

  async createReservation(user: User, reservation: CreateReservationI) {
    if (reservation.reserveFrom >= reservation.reserveTo) {
      throw new BadRequestException(T.ivalidTimeRange);
    }

    const counsellorCheck = await this.counsellorModel
      .findOne(
        user.isSuperAdmin || user.isAdmin
          ? { _id: new Types.ObjectId(reservation.counsellor) }
          : { userId: user.user },
      )
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new NotFoundException(T.counsellorNotFound);
        }
        return d;
      });

    await this.locationService.findSelectedLocation(reservation.location);

    const reservationStartFrom = new Date(reservation.reserveFrom);
    let reservationFrom = new Date(reservation.reserveFrom);
    let reservationTo = new Date(reservation.reserveTo);
    reservationTo.setUTCFullYear(reservationFrom.getUTCFullYear());
    reservationTo.setUTCMonth(reservationFrom.getUTCMonth());
    reservationTo.setUTCDate(reservationFrom.getUTCDate());

    const reservationEndTo = new Date(reservation.reserveTo);

    const reservations: ReservationI[] = [];
    const timeDifference = Math.abs(
      reservationStartFrom.getTime() - reservationEndTo.getTime(),
    );
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysDifference = Math.round(timeDifference / millisecondsPerDay);

    switch (reservation.reserveType) {
      case ReservationTypes.DAY:
        await this.reservationOverridingCheck({
          reserveFrom: reservationStartFrom,
          reserveTo: reservationEndTo,
          counsellor: reservation.counsellor,
          location: reservation.location,
        });

        reservations.push({
          reserveFrom: reservationStartFrom,
          reserveTo: reservationEndTo,
          counsellor: new Types.ObjectId(reservation.counsellor),
          location: new Types.ObjectId(reservation.location),
          ownedBy: counsellorCheck.userId,
          createdBy: user.user,
        });

        return await this.reservationModel.insertMany(reservations);

      case ReservationTypes.DAY_MON:
      case ReservationTypes.DAY_TUE:
      case ReservationTypes.DAY_WED:
      case ReservationTypes.DAY_THU:
      case ReservationTypes.DAY_FRI:
      case ReservationTypes.DAY_SAT:
      case ReservationTypes.DAY_SUN:
        if (
          reservationStartFrom.toDateString().split(' ')[0].toUpperCase() !==
            reservation.reserveType.split('-')[1] ||
          reservationEndTo.toDateString().split(' ')[0].toUpperCase() !==
            reservation.reserveType.split('-')[1]
        )
          throw new BadRequestException(
            `reservation from and reservation end date should be ${
              reservation.reserveType.split('-')[1]
            }`,
          );

        const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksDifference = Math.round(
          timeDifference / millisecondsPerWeek,
        );

        for (let i = -1; i < weeksDifference; i++) {
          await this.reservationOverridingCheck({
            reserveFrom: reservationFrom,
            reserveTo: reservationTo,
            counsellor: reservation.counsellor,
            location: reservation.location,
          });

          reservations.push({
            reserveFrom: reservationFrom,
            reserveTo: reservationTo,
            counsellor: new Types.ObjectId(reservation.counsellor),
            location: new Types.ObjectId(reservation.location),
            ownedBy: counsellorCheck.userId,
            createdBy: user.user,
          });

          reservationFrom = new Date(
            reservationFrom.getTime() + millisecondsPerWeek,
          );
          reservationTo = new Date(
            reservationTo.getTime() + millisecondsPerWeek,
          );
        }
        return await this.reservationModel.insertMany(reservations);

      case ReservationTypes.RANGE:
        if (
          reservationStartFrom.toDateString().split(' ')[0].toUpperCase() !==
          reservation.rangeFrom
        ) {
          throw new BadRequestException(
            `reservation range start date should be ${reservation.rangeFrom}`,
          );
        } else if (
          reservationEndTo.toDateString().split(' ')[0].toUpperCase() !==
          reservation.rangeTo
        ) {
          throw new BadRequestException(
            `reservation range end date should be ${reservation.rangeTo}`,
          );
        }

        let startDay = new Date(reservationFrom).getDay();
        const validDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        for (let i = -1; i < daysDifference; i++) {
          if (
            startDay >= validDays.indexOf(reservation.rangeFrom) &&
            startDay <= validDays.indexOf(reservation.rangeTo)
          ) {
            await this.reservationOverridingCheck({
              reserveFrom: reservationFrom,
              reserveTo: reservationTo,
              counsellor: reservation.counsellor,
              location: reservation.location,
            });

            reservations.push({
              reserveFrom: reservationFrom,
              reserveTo: reservationTo,
              counsellor: new Types.ObjectId(reservation.counsellor),
              location: new Types.ObjectId(reservation.location),
              ownedBy: counsellorCheck.userId,
              createdBy: user.user,
            });
          }

          reservationFrom = new Date(
            reservationFrom.getTime() + millisecondsPerDay,
          );
          reservationTo = new Date(
            reservationTo.getTime() + millisecondsPerDay,
          );

          startDay = startDay + 1;
          if (startDay >= 7) {
            startDay = 0;
          }
        }
        return await this.reservationModel.insertMany(reservations);

      case ReservationTypes.EVERYDAY:
        for (let i = -1; i < daysDifference; i++) {
          await this.reservationOverridingCheck({
            reserveFrom: reservationFrom,
            reserveTo: reservationTo,
            counsellor: reservation.counsellor,
            location: reservation.location,
          });

          reservations.push({
            reserveFrom: reservationFrom,
            reserveTo: reservationTo,
            counsellor: new Types.ObjectId(reservation.counsellor),
            location: new Types.ObjectId(reservation.location),
            ownedBy: counsellorCheck.userId,
            createdBy: user.user,
          });

          reservationFrom = new Date(
            reservationFrom.getTime() + millisecondsPerDay,
          );
          reservationTo = new Date(
            reservationTo.getTime() + millisecondsPerDay,
          );
        }

        return await this.reservationModel.insertMany(reservations);

      default:
        Logger.warn('Unknow reservation type');
    }
  }

  async createDayReservation(
    user: User,
    reservation: CreateForDayReservationI,
  ) {
    if (reservation.reserveFrom >= reservation.reserveTo) {
      Logger.warn(T.ivalidTimeRange.toUpperCase());
      throw new BadRequestException(T.ivalidTimeRange);
    }

    await this.reservationOverridingCheck(reservation);

    const counsellorCheck = await this.counsellorModel
      .findOne(
        user.isSuperAdmin || user.isAdmin
          ? { _id: new Types.ObjectId(reservation.counsellor) }
          : { userId: user.user },
      )
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.debug(T.counsellorNotFound.toUpperCase());
          throw new NotFoundException(T.counsellorNotFound);
        }
        return d;
      });

    await this.locationService.findSelectedLocation(reservation.location);

    const createdReservation = await this.reservationModel.create({
      ...reservation,
      counsellor: new Types.ObjectId(counsellorCheck._id),
      location: new Types.ObjectId(reservation.location),
      ownedBy: counsellorCheck.userId,
      createdBy: user.user,
    });

    return createdReservation;
  }

  async updateSelectedReservation(
    reservationId: string,
    reservation: UpdateReservationI,
  ) {
    await this.findSelectedReservation(reservationId);

    await this.reservationModel
      .find({
        $or: [
          {
            $and: [
              { _id: { $ne: reservationId } },
              { location: new Types.ObjectId(reservation?.location) },
              { reserveFrom: { $lte: reservation?.reserveFrom } },
              { reserveTo: { $gte: reservation?.reserveFrom } },
            ],
          },
          {
            $and: [
              { _id: { $ne: reservationId } },
              { location: new Types.ObjectId(reservation?.location) },
              { reserveFrom: { $lte: reservation?.reserveTo } },
              { reserveTo: { $gte: reservation?.reserveTo } },
            ],
          },
          {
            $and: [
              { _id: { $ne: reservationId } },
              { location: new Types.ObjectId(reservation?.location) },
              { reserveFrom: { $gte: reservation?.reserveFrom } },
              { reserveTo: { $lte: reservation?.reserveTo } },
            ],
          },
        ],
      })
      .then(async (d) => {
        if (isNotEmpty(d[0])) {
          Logger.warn(T.alreadyReserved.toUpperCase());
          throw new BadRequestException(T.alreadyReserved);
        }
      });

    const updatedReservation = await this.reservationModel.findByIdAndUpdate(
      reservationId,
      {
        $set: {
          ...reservation,
          ...(reservation.location
            ? { location: new Types.ObjectId(reservation.location) }
            : {}),
        },
      },
      { new: true, lean: true },
    );

    return updatedReservation;
  }

  async deleteSelectedReservation(reservationId: string) {
    await this.reservationModel.findByIdAndUpdate(reservationId).lean();

    const deletedRservation = await this.reservationModel.findByIdAndRemove(
      reservationId,
    );
    return deletedRservation;
  }

  async reservationOverridingCheck(reservation: CreateForDayReservationI) {
    await this.reservationModel
      .find({
        $and: [
          {
            $or: [
              { location: new Types.ObjectId(reservation.location) },
              { counsellor: new Types.ObjectId(reservation.counsellor) },
            ],
          },
          {
            $or: [
              {
                reserveFrom: {
                  $gt: reservation.reserveFrom,
                  $lt: reservation.reserveTo,
                },
              },
              {
                reserveTo: {
                  $gt: reservation.reserveFrom,
                  $lt: reservation.reserveTo,
                },
              },
              {
                $and: [
                  {
                    reserveFrom: { $lte: reservation.reserveFrom },
                  },
                  {
                    reserveTo: { $gte: reservation.reserveTo },
                  },
                ],
              },
            ],
          },
        ],
        // $or: [
        //   {
        //     $and: [
        //       {
        //         $or: [
        //           { location: new Types.ObjectId(reservation.location) },
        //           { counsellor: new Types.ObjectId(reservation.counsellor) },
        //         ],
        //       },
        //       { reserveFrom: { $lte: reservation.reserveFrom } },
        //       { reserveTo: { $gte: reservation.reserveFrom } },
        //     ],
        //   },
        //   {
        //     $and: [
        //       {
        //         $or: [
        //           { location: new Types.ObjectId(reservation.location) },
        //           { counsellor: new Types.ObjectId(reservation.counsellor) },
        //         ],
        //       },
        //       { reserveFrom: { $lte: reservation.reserveTo } },
        //       { reserveTo: { $gte: reservation.reserveTo } },
        //     ],
        //   },
        //   {
        //     $and: [
        //       {
        //         $or: [
        //           { location: new Types.ObjectId(reservation.location) },
        //           { counsellor: new Types.ObjectId(reservation.counsellor) },
        //         ],
        //       },
        //       { reserveFrom: { $gte: reservation.reserveFrom } },
        //       { reserveTo: { $lte: reservation.reserveTo } },
        //     ],
        //   },
        // ],
      })
      .then(async (d) => {
        if (isNotEmpty(d[0])) {
          Logger.warn(T.alreadyReserved.toUpperCase());
          throw new BadRequestException(T.alreadyReserved);
        }
      });
  }
}
