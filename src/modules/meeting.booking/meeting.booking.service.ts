import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MEETING_BOOKING_COLLECTION } from './meeting.booking.constants';
import { Model, Types } from 'mongoose';
import {
  MeetingBooking,
  MeetingBookingStatus,
  MeetingBookingType,
} from './schema/meeting.booking.schema';
import { isEmpty, isEnum, isNotEmpty } from 'class-validator';
import { MeetingBookingQueryI } from './meeting.booking.types';
import {
  addDays,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { User } from 'src/config/authorization/user.decorator';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { SCHEDULE_COLLECTION } from '../schedule/schedule.constants';
import { Schedule } from '../schedule/schema/schedule.schema';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/schema/notification.schema';
import { formatInTimeZone } from 'date-fns-tz';
import { BOOKING_PAYMENT_COLLECTION } from '../booking.payment/booking.payment.constants';
import { BookingPayment } from '../booking.payment/schema/booking.payment.schema';
import { CalendarService } from 'src/config/microsoft-graph/calendar/calendar.service';

const T = {
  meetingBookingNotFound: 'meeting booking id is not found',
};

@Injectable()
export class MeetingBookingService {
  constructor(
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    @InjectModel(SCHEDULE_COLLECTION)
    private readonly scheduleModel: Model<Schedule>,
    private readonly notificationService: NotificationService,
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    private readonly calendarService: CalendarService,
  ) {}

  async findAll(
    user: User,
    limit: number,
    page: number,
    query: MeetingBookingQueryI,
  ) {
    const filter: any = {};

    if (
      !user.isSuperAdmin &&
      !user.isAdmin &&
      user.isCounsellor &&
      isNotEmpty(user.counsellor)
    )
      filter.counsellor = new Types.ObjectId(user.counsellor);

    if (isNotEmpty(query.status) && isEnum(query.status, MeetingBookingStatus))
      filter.status = query.status;

    if (isNotEmpty(query.date)) {
      const today = new Date();

      switch (query.date) {
        case 'TODAY':
          filter.timeFrom = {
            $gte: startOfDay(today),
            $lt: endOfDay(today),
          };
          break;
        case 'TOMORROW':
          const tomorrow = addDays(today, 1);
          filter.timeFrom = {
            $gte: startOfDay(tomorrow),
            $lt: endOfDay(tomorrow),
          };
          break;
        case 'WEEK':
          const weekStart = startOfWeek(today);
          const weekEnd = endOfWeek(today);
          filter.timeFrom = {
            $gte: weekStart,
            $lt: weekEnd,
          };
          break;
        case 'ALL':
          break;
        default:
          break;
      }
    }

    if (
      (isNotEmpty(query.dateFrom) || isNotEmpty(query.dateTo)) &&
      isEmpty(query.date)
    ) {
      if (isNotEmpty(query.dateFrom))
        filter.timeFrom = {
          $gte: query.dateFrom,
        };

      if (isNotEmpty(query.dateTo))
        filter.timeTo = {
          $lt: query.dateTo,
        };
    }

    const totalDocs = await this.meetingBookingModel.countDocuments({
      status: { $ne: MeetingBookingStatus.PENDIND },
      ...filter,
    });
    const totalPages = Math.ceil(totalDocs / limit);

    const meetingBookingCheck = await this.meetingBookingModel
      .find({
        status: { $ne: MeetingBookingStatus.PENDIND },
        ...filter,
      })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'client', select: '_id name phone email' },
        {
          path: 'counsellor',
          select:
            '_id profilePictureURL title displayName specialization email mobile hotline',
        },
        { path: 'meeting', select: '_id meetingType internalName description' },
        { path: 'room', select: '_id name' },
        { path: 'service', select: '_id title description' },
      ])
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: meetingBookingCheck,
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

  async findAllBookingClient(
    user: User,
    limit: number,
    page: number,
    query: MeetingBookingQueryI,
  ) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin) {
      const counsellorCheck = await this.counsellorModel
        .findOne({
          userId: user.user,
        })
        .lean();

      filter.counsellor = new Types.ObjectId(counsellorCheck._id);
    }

    if (
      isNotEmpty(query.status) &&
      isEnum(query.status, MeetingBookingStatus)
    ) {
      filter.status = query.status;
    }

    if (isNotEmpty(query.date)) {
      const today = new Date();

      switch (query.date) {
        case 'TODAY':
          filter.timeFrom = {
            $gte: startOfDay(today),
            $lt: endOfDay(today),
          };
          break;
        case 'TOMORROW':
          const tomorrow = addDays(today, 1);
          filter.timeFrom = {
            $gte: startOfDay(tomorrow),
            $lt: endOfDay(tomorrow),
          };
          break;
        case 'WEEK':
          const weekStart = startOfWeek(today);
          const weekEnd = endOfWeek(today);
          filter.timeFrom = {
            $gte: weekStart,
            $lt: weekEnd,
          };
          break;
        case 'ALL':
          break;
        default:
          break;
      }
    }

    if (
      (isNotEmpty(query.dateFrom) || isNotEmpty(query.dateTo)) &&
      isEmpty(query.date)
    ) {
      if (isNotEmpty(query.dateFrom)) {
        filter.timeFrom = {
          $gte: query.dateFrom,
        };
      }

      if (isNotEmpty(query.dateTo)) {
        filter.timeTo = {
          $lt: query.dateTo,
        };
      }
    }

    const totalDocs = await this.meetingBookingModel.countDocuments({
      status: { $ne: MeetingBookingStatus.PENDIND },
      ...filter,
    });
    const totalPages = Math.ceil(totalDocs / limit);

    const meetingBookingCheck = await this.meetingBookingModel
      .find({
        status: { $ne: MeetingBookingStatus.PENDIND },
        ...filter,
      })
      .sort({ createdAt: -1 })
      .populate('client')
      .lean()
      .then(async (d) => {
        return d.map((client) => {
          return client.client;
        });
      });

    return {
      docs: meetingBookingCheck,
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

  async findById(meetingBooking: string): Promise<MeetingBooking> {
    const meetingBookingCheck = await this.meetingBookingModel
      .findById(meetingBooking)
      .populate([
        { path: 'client' },
        {
          path: 'counsellor',
          select:
            '_id profilePictureURL title displayName specialization email',
        },
        { path: 'meeting', select: '_id meetingType internalName description' },
        { path: 'room', select: '_id name' },
        { path: '_bookingPaymentId' },
      ]);

    if (isEmpty(meetingBookingCheck))
      throw new NotFoundException(T.meetingBookingNotFound);

    return meetingBookingCheck;
  }

  async updateMeetingBooking(meetingBookingId: string, meetingBooking: any) {
    return await this.meetingBookingModel.findByIdAndUpdate(
      meetingBookingId,
      meetingBooking,
      { new: true, lean: true },
    );
  }

  async deleteById(meetingBooking: string) {
    await this.findById(meetingBooking);

    const deletedMeetingBooking =
      await this.meetingBookingModel.findByIdAndDelete(meetingBooking);

    return deletedMeetingBooking;
  }

  async changeMeetingBookingStatus(meetingBookingId: string, status: string) {
    const meetingBookingCheck = await this.findById(meetingBookingId);

    const updatedMeetingBooking =
      await this.meetingBookingModel.findByIdAndUpdate(
        meetingBookingId,
        { $set: { status: status } },
        { new: true, lean: true },
      );

    if (status === MeetingBookingStatus.CANCELLED) {
      await this.scheduleModel.findOneAndUpdate(
        {
          counsellor: new Types.ObjectId(meetingBookingCheck.counsellor._id),
          startTime: new Date(meetingBookingCheck.timeFrom),
        },
        { booked: false },
        { new: true, lean: true },
      );

      await this.calendarService
        .cancelScheduleMeeting(
          meetingBookingCheck.counsellor.email,
          meetingBookingCheck.calendarEventId,
        )
        .catch((e) => {
          console.log('e: ', e.message);
        });

      if (meetingBookingCheck.client?.notificationType?.email === true) {
        const bookingCancellationDataForClient = {
          CounselorName: meetingBookingCheck.counsellor.displayName,
          CustomerName: meetingBookingCheck.client.name,
          BookingID: meetingBookingCheck._id,
          BookingDate: formatInTimeZone(
            meetingBookingCheck.timeFrom,
            meetingBookingCheck.timezone,
            'dd MMM yyyy',
          ),
          BookingTime: `${formatInTimeZone(
            new Date(meetingBookingCheck.timeFrom),
            meetingBookingCheck.timezone,
            'hh:mm aaaa',
          )} - ${formatInTimeZone(
            new Date(meetingBookingCheck.timeTo),
            meetingBookingCheck.timezone,
            'hh:mm aaaa',
          )} (${meetingBookingCheck.timezone})`,
          BookingLocation:
            meetingBookingCheck.meetingBookingType != MeetingBookingType.ONLINE
              ? meetingBookingCheck.room.name
              : 'Online',
          ContactEmail: 'manisha@umbartha.org',
          ContactPhone: '+94 76 416 4972',
          ContactInformation: 'info@umbartha.org',
          YearOngoing: '${new Date().getFullYear()}',
        };

        await this.notificationService.sendNotification(
          '66878f2e67a4a0f353dde920',
          NotificationType.EMAIL,
          [meetingBookingCheck.client.email],
          'Booking Cancellation',
          bookingCancellationDataForClient,
        );
      }

      /**
       * booking cancellation for counsellor
       */
      const bookingCancellationDataForCounsellor = {
        CounselorName: meetingBookingCheck.counsellor.displayName,
        CustomerName: meetingBookingCheck.client.name,
        BookingID: meetingBookingCheck._id,
        BookingDate: formatInTimeZone(
          meetingBookingCheck.timeFrom,
          meetingBookingCheck.timezone,
          'dd MMM yyyy',
        ),
        BookingTime: `${formatInTimeZone(
          new Date(meetingBookingCheck.timeFrom),
          meetingBookingCheck.timezone,
          'hh:mm aaaa',
        )} - ${formatInTimeZone(
          new Date(meetingBookingCheck.timeTo),
          meetingBookingCheck.timezone,
          'hh:mm aaaa',
        )} (${meetingBookingCheck.timezone})`,
        BookingLocation: meetingBookingCheck.room
          ? meetingBookingCheck.room.name
          : 'Online',
        ContactEmail: 'manisha@umbartha.org',
        ContactPhone: '+94 76 416 4972',
        ContactInformation: 'info@umbartha.org',
        YearOngoing: '${new Date().getFullYear()}',
      };

      await this.notificationService.sendNotification(
        '66878f0f67a4a0f353dde91b',
        NotificationType.EMAIL,
        [meetingBookingCheck.counsellor.email],
        'Booking Cancellation Notification',
        bookingCancellationDataForCounsellor,
      );
    }

    return updatedMeetingBooking;
  }

  async appointmentGraphData(user: User) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin) {
      const counsellorCheck = await this.counsellorModel
        .findOne({
          userId: user.user,
        })
        .lean();

      filter.counsellor = new Types.ObjectId(counsellorCheck._id);
    }
    filter.status = MeetingBookingStatus.PROCESSING;

    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

    const appointmentOfWeek: number[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i);
      const nextDay = addDays(monday, i + 1);

      const countOfDocs = await this.meetingBookingModel.count({
        ...filter,
        timeFrom: { $gte: day, $lt: nextDay },
      });

      appointmentOfWeek.push(countOfDocs);
    }

    return appointmentOfWeek;
  }
}
