import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SCHEDULE_COLLECTION } from './schedule.constants';
import { Model, Types } from 'mongoose';
import { Schedule } from './schema/schedule.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { ScheduleI } from './schedule.types';
import { format, startOfDay } from 'date-fns';
import { User } from 'src/config/authorization/user.decorator';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CLIENT_COLLECTION } from '../client/client.constants';
import { Client, ClientExsisted } from '../client/schemas/client.schema';
import { NotificationService } from '../notification/notification.service';
import { BOOKING_PAYMENT_COLLECTION } from '../booking.payment/booking.payment.constants';
import { BookingPayment } from '../booking.payment/schema/booking.payment.schema';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import {
  MeetingBooking,
  MeetingBookingStatus,
} from '../meeting.booking/schema/meeting.booking.schema';
import { formatInTimeZone } from 'date-fns-tz';
import { NotificationType } from '../notification/schema/notification.schema';
import { ICalEventData } from 'ical-generator';
import { CalendarService } from 'src/config/microsoft-graph/calendar/calendar.service';

const T = {
  scheduleNotFound: 'schedule is not found',
};

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(SCHEDULE_COLLECTION)
    private readonly scheduleModel: Model<Schedule>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    @InjectModel(CLIENT_COLLECTION) private readonly clientModel: Model<Client>,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    private readonly notificationService: NotificationService,
    private readonly calendarService: CalendarService,
  ) {}

  async findAll(search: string, query: any, limit: number, page: number) {
    const pipeline = [];

    pipeline.push({
      $match: {
        meeting: new Types.ObjectId(query.meetingId),
      },
    });

    pipeline.push(
      /**
       * Stage 1: Lookup to join with reservation collection
       */
      {
        $lookup: {
          from: 'locations',
          let: { roomIds: '$room' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $map: {
                        input: '$$roomIds',
                        as: 'id',
                        in: {
                          $convert: {
                            input: '$$id',
                            to: 'objectId',
                            onError: null, // Ignore invalid ObjectId conversion
                            onNull: null, // Handle null values gracefully
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1, // Include the _id field
                name: 1,
              },
            },
          ],
          as: 'room',
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

    if (isNotEmpty(query.startTime)) {
      pipeline.push({
        $match: {
          startTime: { $gte: new Date(query.startTime) },
        },
      });
    }

    if (isNotEmpty(query.endTime)) {
      pipeline.push({
        $match: {
          endTime: { $lte: new Date(query.endTime) },
        },
      });
    }

    const totalDocs = (await this.scheduleModel.aggregate(pipeline)).length;
    const totalPages = Math.ceil(totalDocs / limit);

    // Add other stages to the pipeline
    pipeline.push(
      { $sort: { startTime: 1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    );

    const schedulesCheck = await this.scheduleModel.aggregate(pipeline);

    return {
      docs: schedulesCheck,
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

  async findSelectedSchedule(scheduleId: string) {
    const scheduleCheck = await this.scheduleModel
      .findById(scheduleId)
      .lean()
      .populate([
        {
          path: 'counsellor',
          select: 'profilePictureURL displayName email mobile specialization',
        },
        {
          path: 'meeting',
        },
        {
          path: 'room',
          select: 'name meetingRoom',
        },
      ]);

    if (isEmpty(scheduleCheck)) {
      throw new NotFoundException(T.scheduleNotFound);
    }

    return scheduleCheck;
  }

  async createSchedule(schedule: ScheduleI) {
    const createdSchedule = await this.scheduleModel.create(schedule);

    return createdSchedule;
  }

  async addSchedules(schedule: ScheduleI[]) {
    schedule;

    const createdSchedule = await this.scheduleModel.insertMany(
      schedule.map((scheduleCheck) => {
        let room;
        if (isNotEmpty(scheduleCheck.room[0]))
          room = scheduleCheck.room.map(
            (roomCheck) => new Types.ObjectId(roomCheck),
          );

        return { ...scheduleCheck, room: room };
      }),
    );

    return createdSchedule;
  }

  /**
   * Books a schedule for a client and sends booking confirmation notification
   *
   * @param clientId
   * @param scheduleId
   * @param timeZone
   * @returns the udpated schedule object
   * @throws if the schedule or client is not found
   * @throws if the booking cannot be processed
   */
  async bookSchedule(
    clientId: string,
    scheduleId: string,
    timeZone: string,
  ): Promise<Schedule> {
    const scheduleCheck: any = await this.findSelectedSchedule(scheduleId);

    const meetingBookingCheck = await this.meetingBookingModel
      .findOne({
        timeFrom: scheduleCheck.startTime,
      })
      .sort({ createdAt: -1 })
      .lean();

    const bookingPaymentCheck: any = await this.bookingPaymentModel
      .find({
        client: new Types.ObjectId(clientId),
      })
      .sort({ updatedAt: -1 })
      .populate([{ path: 'paymentOption' }]);

    const clientCheck = await this.clientModel.findById(clientId).lean();

    const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
      scheduleId,
      { $set: { booked: true } },
      { new: true, lean: true },
    );

    await this.meetingBookingModel.findByIdAndUpdate(
      meetingBookingCheck._id,
      {
        status: MeetingBookingStatus.PROCESSING,
      },
      { new: true },
    );

    /**
     * Booking confirmation mail send to client
     */
    const bookingConfirmationForClientData = {
      CustomerName: clientCheck.name,
      CounsellorName: scheduleCheck.counsellor.displayName,
      BookingID: meetingBookingCheck._id,
      BookingDate: formatInTimeZone(
        new Date(scheduleCheck.startTime),
        timeZone,
        'dd MMM yyyy',
      ),
      BookingTime: `${formatInTimeZone(
        new Date(scheduleCheck.startTime),
        timeZone,
        'hh:mm aaaa',
      )} - ${formatInTimeZone(
        new Date(scheduleCheck.endTime),
        timeZone,
        'hh:mm aaaa',
      )} (${timeZone})`,
      BookingLocation: scheduleCheck.room[0]
        ? scheduleCheck.room[0].name
        : 'Online',
      ContactEmail: scheduleCheck.counsellor.email,
      ContactPhone: scheduleCheck.counsellor.phone,
      ContactInformation: 'info@umbartha.org',
      YearOngoing: formatInTimeZone(new Date(), timeZone, 'yyyy'),
      Online: scheduleCheck.meetingType === 'ONLINE' ? true : false,
      MeetingLink: scheduleCheck?.meetingLink,
      SpecialInstruction: scheduleCheck.meeting?.specialInstruction,
      CancellationPolicy: scheduleCheck.meeting?.cancellationPolicy,
      PayPal: isNotEmpty(
        bookingPaymentCheck[0]?.paymentOption?.payPal?.paymentLink,
      ),
      PaymentLink: bookingPaymentCheck[0]?.paymentOption?.payPal?.paymentLink,
      BankTransfer: isNotEmpty(
        bookingPaymentCheck[0]?.paymentOption?.bankDetails,
      ),
      OtherOptions: bookingPaymentCheck[0]?.paymentOption?.otherOptions,
      BankDetails: [
        {
          HolderName:
            bookingPaymentCheck[0]?.paymentOption?.bankDetails
              ?.accountHolderName,
          AccountNumber:
            bookingPaymentCheck[0]?.paymentOption?.bankDetails?.accountNumber,
          BankName:
            bookingPaymentCheck[0]?.paymentOption?.bankDetails?.bankName,
          BranchName:
            bookingPaymentCheck[0]?.paymentOption?.bankDetails?.branchName,
          HolderPhoneNumber:
            bookingPaymentCheck[0]?.paymentOption?.bankDetails
              ?.accountHolderPhone,
        },
      ],
    };

    const bookingConfirmationForClientEvent: ICalEventData = {
      organizer: scheduleCheck.counsellor.email,
      start: new Date(scheduleCheck.startTime),
      end: new Date(scheduleCheck.endTime),
      summary: 'Booking Confirmation',
      location: scheduleCheck.room[0] ? scheduleCheck.room[0].name : 'Online',
      url: 'https://zoom.us/signin#/login',
    };

    this.notificationService
      .sendRawNotification(
        '66878f5367a4a0f353dde925',
        clientCheck.notificationType,
        [clientCheck.email],
        'Booking Confirmation',
        bookingConfirmationForClientData,
        bookingConfirmationForClientEvent,
      )
      .catch((e) => {
        console.log('e: ', e);
      });

    /**
     * Booking corfirmation SMS to client
     */
    if (clientCheck.notificationType.sms) {
      const bookingConfirmationSMSDataForClient = {
        CancellationPolicy: scheduleCheck.meeting?.cancellationPolicy,
        CustomerName: clientCheck.name,
        AppointmentDate: formatInTimeZone(
          new Date(scheduleCheck.startTime),
          timeZone,
          'dd MMM yyyy',
        ),
        AppointmentTime: `${formatInTimeZone(
          new Date(scheduleCheck.startTime),
          timeZone,
          'hh:mm aaaa',
        )} - ${formatInTimeZone(
          new Date(scheduleCheck.endTime),
          timeZone,
          'hh:mm aaaa',
        )} (${timeZone})`,
      };

      this.notificationService
        .sendNotification(
          '6687908b67a4a0f353dde961',
          NotificationType.SMS,
          [clientCheck.phone],
          'Booking Confirmation',
          bookingConfirmationSMSDataForClient,
        )
        .catch((e) => {
          console.log('e: ', e);
        });
    }

    /**
     * booking corfirmation for counsellor 66878f7d67a4a0f353dde92a
     */
    const bookingConfirmationDataForCounsellor = {
      CounselorName: scheduleCheck.counsellor.displayName,
      BookingID: meetingBookingCheck._id,
      CustomerName: clientCheck.name,
      BookingDate: formatInTimeZone(
        new Date(scheduleCheck.startTime),
        timeZone,
        'dd MMM yyyy',
      ),
      BookingTime: `${formatInTimeZone(
        new Date(scheduleCheck.startTime),
        timeZone,
        'hh:mm aaaa',
      )} - ${formatInTimeZone(
        new Date(scheduleCheck.endTime),
        timeZone,
        'hh:mm aaaa',
      )} (${timeZone})`,
      BookingLocation: scheduleCheck.room[0]
        ? scheduleCheck.room[0].name
        : 'Online',
      ContactEmail: 'manisha@umbartha.org',
      ContactPhone: '+94 76 416 4972',
      ContactInformation: 'info@umbartha.org',
      YearOngoing: formatInTimeZone(new Date(), timeZone, 'yyyy'),
    };

    this.notificationService
      .sendNotification(
        '66878f7d67a4a0f353dde92a',
        NotificationType.EMAIL,
        [scheduleCheck.counsellor.email],
        'New Booking Notification',
        bookingConfirmationDataForCounsellor,
      )
      .catch((e) => {
        console.log('e: ', e);
      });

    const calendarEvent = {
      subject: `Meeting with ${clientCheck.name}`,
      body: {
        contentType: 'HTML',
        content: `<div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Booking ID:</strong> ${
          meetingBookingCheck._id
        }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Client:</strong> ${
                    clientCheck.name
                  }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Location:</strong> ${
                    scheduleCheck.room[0]
                      ? scheduleCheck.room[0].name
                      : 'Online'
                  }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Meeting Link:</strong> ${
                    scheduleCheck?.meetingLink
                  }</div>`,
      },
      start: {
        dateTime: new Date(scheduleCheck.startTime),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(scheduleCheck.endTime),
        timeZone: 'UTC',
      },
      showAs: 'busy',
      location: {
        displayName: scheduleCheck.room[0]
          ? scheduleCheck.room[0].name
          : 'Online',
      },
      attendees: [
        {
          type: 'required',
          emailAddress: {
            name: clientCheck.name,
            address: clientCheck.email.toLowerCase(),
          },
        },
      ],
    };

    await this.calendarService.createScheduleMeeting(
      scheduleCheck.counsellor.email,
      calendarEvent,
    );

    // await this.notificationService.create({
    //   counsellor: scheduleCheck.counsellor,
    //   client: clientCheck,
    //   bookingDate: scheduleCheck.startTime,
    //   location: scheduleCheck.room[0]
    //     ? scheduleCheck.room[0].name
    //         .split(' ')
    //         .map((word) => {
    //           return word[0].toUpperCase() + word.slice(1).toLowerCase();
    //         })
    //         .join(' ')
    //     : 'Online',
    // });

    this.clientModel.findByIdAndUpdate(
      clientId,
      {
        exsisted: ClientExsisted.EXSISTED,
      },
      { new: true, lean: true },
    );

    return updatedSchedule;
  }

  async deleteSchedule(scheduleId: string) {
    await this.findSelectedSchedule(scheduleId);

    const deletedSchedule = await this.scheduleModel.findByIdAndRemove(
      scheduleId,
    );
    return deletedSchedule;
  }

  async scheduleOverriding(
    counsellorId: string,
    startTime: Date,
    endTime: Date,
  ) {
    return await this.scheduleModel.find({
      counsellor: new Types.ObjectId(counsellorId),
      $or: [
        // Overlapping cases
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        // Exact same time
        {
          $and: [
            { startTime: { $eq: startTime } },
            { endTime: { $eq: endTime } },
          ],
        },
      ],
    });
  }

  async dashboardCalendarDate(user: User) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin) {
      const counsellorCheck = await this.counsellorModel
        .findOne({
          userId: user.user,
        })
        .lean();

      filter.counsellor = new Types.ObjectId(counsellorCheck._id);
    }

    const schedulesCheck = await this.scheduleModel
      .find({
        ...filter,
        startTime: { $gte: startOfDay(new Date()) },
      })
      .lean();

    const calendarDate = [];
    for (const schedule of schedulesCheck) {
      calendarDate.push(format(schedule.startTime, 'yyyy-MM-dd'));
    }

    return calendarDate;
  }
}
