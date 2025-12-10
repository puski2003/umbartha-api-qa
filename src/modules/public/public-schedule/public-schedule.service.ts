import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty, isNotEmpty } from 'class-validator';
import { Model, Types } from 'mongoose';
import { SCHEDULE_COLLECTION } from 'src/modules/schedule/schedule.constants';
import { Schedule } from 'src/modules/schedule/schema/schedule.schema';
import { AppointmentDetailsI, ScheduleQueryI } from './public-schedule.types';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import {
  MeetingBooking,
  MeetingBookingStatus,
} from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import {
  Client,
  ClientExsisted,
} from 'src/modules/client/schemas/client.schema';
import { PublicBookingPaymentService } from '../public-booking.payment/public-booking.payment.service';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import {
  BookingPayment,
  BookingPaymentStatus,
  PaypalStatus,
} from 'src/modules/booking.payment/schema/booking.payment.schema';
import { formatInTimeZone } from 'date-fns-tz';
import { ICalEventData } from 'ical-generator';
import { NotificationService } from 'src/modules/notification/notification.service';
import { CalendarService } from 'src/config/microsoft-graph/calendar/calendar.service';
import { NotificationType } from 'src/modules/notification/schema/notification.schema';
import { PAYMENT_OPTION_COLLECTION } from 'src/modules/payment.option/payment.option.constants';
import { MeetingType } from 'src/modules/meeting/schemas/meeting.schema';
import { OrderService } from 'src/config/paypal/order/order.service';
import * as CC from 'currency-converter-lt';

@Injectable()
export class PublicScheduleService {
  private currencyConverter;

  constructor(
    @InjectModel(SCHEDULE_COLLECTION)
    private readonly scheduleModel: Model<Schedule>,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    @InjectModel(CLIENT_COLLECTION) private readonly clientModel: Model<Client>,
    private readonly bookingPaymentService: PublicBookingPaymentService,
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    private readonly notificationService: NotificationService,
    private readonly calendarService: CalendarService,
    private readonly orderService: OrderService,
  ) {
    this.currencyConverter = new CC();
  }

  async findAll(query: ScheduleQueryI): Promise<Schedule[]> {
    const pipeline = [];

    pipeline.push({
      $match: {
        booked: false,
      },
    });

    pipeline.push({
      $match: {
        expiresIn: { $lt: new Date() },
        startTime: { $gte: new Date() },
      },
    });

    if (isNotEmpty(query.counsellor))
      pipeline.push({
        $match: {
          counsellor: new Types.ObjectId(query.counsellor),
        },
      });

    if (isNotEmpty(query.startDate)) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
              query.startDate,
            ],
          },
        },
      });
    }

    if (isNotEmpty(query.startTime))
      pipeline.push({
        $match: {
          startTime: { $eq: new Date(query.startTime) },
        },
      });

    if (isNotEmpty(query.meetingType))
      pipeline.push({
        $match: {
          meetingType: { $in: [query.meetingType, MeetingType.BOTH] },
        },
      });

    pipeline.push(
      {
        $lookup: {
          from: 'counsellors',
          let: { counsellorId: { $toObjectId: '$counsellor' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$counsellorId'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                profilePictureURL: 1,
                displayName: 1,
                email: 1,
                mobile: 1,
                specialization: 1,
                publishCalendar: 1,
                services: 1,
              },
            },
          ],
          as: 'counsellor',
        },
      },
      {
        $unwind: {
          path: '$counsellor',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'counsellor.publishCalendar': true,
        },
      },
    );

    pipeline.push({
      $lookup: {
        from: 'services',
        let: { serviceIds: '$counsellor.services' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  '$_id',
                  {
                    $map: {
                      input: '$$serviceIds',
                      as: 'id',
                      in: { $toObjectId: '$$id' },
                    },
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              title: 1,
            },
          },
        ],
        as: 'counsellor.services',
      },
    });

    pipeline.push(
      {
        $lookup: {
          from: 'meetings',
          let: { meetingId: { $toObjectId: '$meeting' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$meetingId'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                meetingType: 1,
                organizer: 1,
                internalName: 1,
              },
            },
          ],
          as: 'meeting',
        },
      },
      {
        $unwind: {
          path: '$meeting',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    pipeline.push({
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
                      in: { $toObjectId: '$$id' },
                    },
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'room',
      },
    });

    pipeline.push({
      $sort: {
        startTime: 1,
      },
    });

    const scheduleCheck = await this.scheduleModel.aggregate(pipeline);

    return scheduleCheck;
  }

  async findById(schedule: string) {
    const scheduleCheck = await this.scheduleModel
      .findById(schedule)
      .populate([
        {
          path: 'counsellor',
          select:
            'profilePictureURL displayName email mobile specialization services',
          populate: {
            path: 'services',
            model: SERVICE_COLLECTION,
            select: 'name title',
          },
        },
        {
          path: 'client',
          select:
            'name phone email secondaryName secondaryEmail notificationType',
        },
        {
          path: 'meeting',
          select: 'internalName timezone cancellationPolicy specialInstruction',
        },
        {
          path: 'room',
          select: 'name meetingRoom',
        },
        {
          path: 'meetingBooking',
          select: 'timezone meetingBookingType status currency service',
          populate: {
            path: 'service',
            model: SERVICE_COLLECTION,
            select: 'name title',
          },
        },
        {
          path: 'bookingPayment',
          select:
            'amount currency completed paypal bankDetails otherOptions status paid',
          populate: {
            path: 'paymentOption',
            model: PAYMENT_OPTION_COLLECTION,
          },
        },
      ])
      .lean();

    if (isEmpty(scheduleCheck))
      throw new NotFoundException('schedule is not found');

    return scheduleCheck;
  }

  async scheduleBookingProceed(
    schedule: string,
    meetingBookingType: string,
    timezone: string,
  ) {
    const scheduleCheck = await this.scheduleModel.findById(schedule).lean();

    const newMeetingBooking = await this.meetingBookingModel.create({
      counsellor: new Types.ObjectId(scheduleCheck.counsellor._id),
      meeting: new Types.ObjectId(scheduleCheck.meeting._id),
      ...(isNotEmpty(
        scheduleCheck?.room[0] && meetingBookingType == MeetingType.ON_PREMISE,
      )
        ? { room: new Types.ObjectId(scheduleCheck.room[0]._id) }
        : {}),
      timeFrom: new Date(scheduleCheck.startTime),
      timeTo: new Date(scheduleCheck.endTime),
      status: MeetingBookingStatus.PENDIND,
      meetingBookingType: meetingBookingType,
      timezone: timezone,
    });

    return await this.scheduleModel.findByIdAndUpdate(
      schedule,
      {
        $set: {
          meetingBooking: new Types.ObjectId(newMeetingBooking._id),
          expiresIn: new Date(new Date().getTime() + 1800000),
        },
      },
      { new: true, lean: true },
    );
  }

  async createAppointment(schedule: string, appointment: AppointmentDetailsI) {
    const scheduleCheck = await this.scheduleModel.findById(schedule).lean();

    const createdClient = await this.clientModel.findOneAndUpdate(
      { email: appointment.email },
      {
        $set: {
          ...appointment,
          ...(appointment?.secondaryEmail
            ? { secondaryEmail: appointment.secondaryEmail }
            : { secondaryEmail: '' }),
          phoneVerified: false,
          emailVerified: false,
        },
      },
      { new: true, lean: true, upsert: true },
    );

    const createdBookingPayment =
      await this.bookingPaymentService.createBookingPayment({
        ...scheduleCheck,
        client: createdClient._id,
        service: appointment.service,
        country: appointment.country,
        nationality: appointment.nationality,
      });

    await this.meetingBookingModel.findByIdAndUpdate(
      scheduleCheck.meetingBooking,
      {
        $set: {
          client: new Types.ObjectId(createdClient._id),
          bookingPayment: new Types.ObjectId(createdBookingPayment._id),
          _bookingPaymentId: new Types.ObjectId(createdBookingPayment._id),
          ...(appointment?.service
            ? { service: new Types.ObjectId(appointment.service) }
            : {}),
        },
      },
      { new: true, lean: true },
    );

    return await this.scheduleModel.findByIdAndUpdate(
      schedule,
      {
        $set: {
          client: new Types.ObjectId(createdClient._id),
          bookingPayment: new Types.ObjectId(createdBookingPayment._id),
        },
      },
      { new: true, lean: true },
    );
  }

  async bookingProceed(schedule: string) {
    const scheduleCheck = await this.findById(schedule);

    if (
      isNotEmpty(
        scheduleCheck.bookingPayment.paymentOption?.payPal?.accountId,
      ) ||
      isNotEmpty(scheduleCheck.bookingPayment.paymentOption?.payPal?.email)
    ) {
      return await this.paypalCheckoutOrder(scheduleCheck);
    } else {
      return await this.bookSchedule(scheduleCheck);
    }
  }

  async paypalCheckoutOrder(schedule: Schedule) {
    let amount = schedule.bookingPayment.amount;
    if (schedule.bookingPayment.currency !== 'USD') {
      amount = await this.currencyConverter
        .from(schedule.bookingPayment.currency)
        .to('USD')
        .amount(schedule.bookingPayment.amount)
        .convert();
    }

    const createdOrder = await this.orderService.createOrder({
      merchantId: schedule.bookingPayment.paymentOption.payPal?.accountId,
      email: schedule.bookingPayment.paymentOption.payPal?.email,
      price: amount,
      currencyCode: 'USD',
    });

    const bookingPayment = await this.bookingPaymentModel.findByIdAndUpdate(
      schedule.bookingPayment._id,
      {
        $set: {
          paypal: {
            orderId: createdOrder.id,
            intent: 'CAPTURE',
            status: createdOrder.status,
            createdAt: createdOrder.create_time,
            updatedAt: createdOrder.update_time,
          },
        },
      },
      { new: true, lean: true },
    );

    return bookingPayment.paypal;
  }

  async paypalOrderCapture(schedule: string, order: string) {
    const scheduleCheck = await this.findById(schedule);

    const orderCapture = await this.orderService.captureOrder(order);

    await this.bookingPaymentModel.findByIdAndUpdate(
      scheduleCheck.bookingPayment._id,
      {
        $set: {
          status: BookingPaymentStatus.PAID,
          completed: true,
          amount: 0,
          paid: scheduleCheck.bookingPayment.amount,
          paypal: {
            orderId: orderCapture.id,
            intent: 'CAPTURE',
            status: orderCapture.status,
            amount: scheduleCheck.bookingPayment.amount,
            currency: 'USD',
            payer: {
              name: `${orderCapture.payer.name.given_name} ${orderCapture.payer.name.surname}`,
              email: orderCapture.payer.email_address,
              payerId: orderCapture.payer.payer_id,
              country: orderCapture.payer.address.country_code,
            },
            createdAt: orderCapture.create_time,
            updatedAt: orderCapture.update_time,
          },
        },
        $push: {
          installments: {
            installmentPayment: scheduleCheck.bookingPayment.amount,
            paidOn: new Date(),
            paymentMethod: new Types.ObjectId(
              scheduleCheck.bookingPayment.paymentOption._id,
            ),
          },
        },
      },
      { new: true, lean: true },
    );

    return await this.bookSchedule(scheduleCheck);
  }

  async paypalOrderAuthorizeCanceled(schedule: string, order: string) {
    const scheduleCheck = await this.findById(schedule);

    await this.bookingPaymentModel.findByIdAndUpdate(
      scheduleCheck.bookingPayment._id,
      {
        $set: {
          status: BookingPaymentStatus.CANCELLED,
          paypal: {
            orderId: order,
            status: PaypalStatus.CANCELED,
          },
        },
      },
    );

    return scheduleCheck;
  }

  async paypalOrderAuthorizeFailed(schedule: string, order: string) {
    const scheduleCheck = await this.findById(schedule);

    await this.bookingPaymentModel.findByIdAndUpdate(
      scheduleCheck.bookingPayment._id,
      {
        $set: {
          paypal: {
            orderId: order,
            status: PaypalStatus.FAILED,
          },
        },
      },
    );

    await this.meetingBookingModel.findByIdAndUpdate(
      scheduleCheck.meetingBooking._id,
      { $set: { status: MeetingBookingStatus.FAILED } },
      { new: true, lean: true },
    );

    return scheduleCheck;
  }

  async bookSchedule(schedule: Schedule) {
    await this.meetingBookingModel.findByIdAndUpdate(
      schedule.meetingBooking._id,
      {
        status: MeetingBookingStatus.PROCESSING,
      },
      { new: true, lean: true },
    );

    await this.bookingPaymentModel.findOneAndUpdate(
      {
        _id: schedule.bookingPayment._id,
        status: { $ne: BookingPaymentStatus.PAID },
      },
      { $set: { status: BookingPaymentStatus.PROCESSING } },
      { new: true, lean: true },
    );

    await this.clientModel.findByIdAndUpdate(
      schedule.client._id,
      { $set: { exsisted: ClientExsisted.EXSISTED, existed: true } },
      { new: true, lean: true },
    );

    this.handleNotificationAndCalendar(schedule._id);

    return await this.scheduleModel.findByIdAndUpdate(
      schedule,
      { $set: { booked: true } },
      { new: true, lean: true },
    );
  }

  async handleNotificationAndCalendar(schedule: string) {
    const scheduleCheck = await this.findById(schedule);
    console.log('scheduleCheck: ', scheduleCheck);

    /**
     * Booking confirmation mail send to client
     */
    const bookingConfirmationForClientData = {
      CustomerName: scheduleCheck.client.name,
      CounsellorName: scheduleCheck.counsellor.displayName,
      BookingID: scheduleCheck._id,
      BookingDate: formatInTimeZone(
        new Date(scheduleCheck.startTime),
        scheduleCheck.meetingBooking.timezone,
        'dd MMM yyyy',
      ),
      BookingTime: `${formatInTimeZone(
        new Date(scheduleCheck.startTime),
        scheduleCheck.meetingBooking.timezone,
        'hh:mm aaaa',
      )} - ${formatInTimeZone(
        new Date(scheduleCheck.endTime),
        scheduleCheck.meetingBooking.timezone,
        'hh:mm aaaa',
      )} (${scheduleCheck.meetingBooking.timezone})`,
      BookingLocation:
        scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
          ? 'Online'
          : scheduleCheck.room[0].name,
      ContactEmail: scheduleCheck.counsellor.email,
      ContactPhone: scheduleCheck.counsellor.mobile,
      ContactInformation: 'info@umbartha.org',
      YearOngoing: formatInTimeZone(
        new Date(),
        scheduleCheck.meetingBooking.timezone,
        'yyyy',
      ),
      Online:
        scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
          ? true
          : false,
      MeetingLink: scheduleCheck?.meetingLink,
      SpecialInstruction: scheduleCheck.meeting?.specialInstruction,
      CancellationPolicy: scheduleCheck.meeting?.cancellationPolicy,
      PayPal: isNotEmpty(
        scheduleCheck.bookingPayment?.paymentOption?.payPal?.paymentLink,
      ),
      ServiceName: scheduleCheck.meetingBooking.service?.name,
      PaymentLink:
        scheduleCheck.bookingPayment?.paymentOption?.payPal?.paymentLink,
      BankTransfer: isNotEmpty(
        scheduleCheck.bookingPayment?.paymentOption?.bankDetails,
      ),
      OtherOptions: scheduleCheck.bookingPayment?.paymentOption?.otherOptions,
      BankDetails: [
        {
          HolderName:
            scheduleCheck.bookingPayment?.paymentOption?.bankDetails
              ?.accountHolderName,
          AccountNumber:
            scheduleCheck.bookingPayment?.paymentOption?.bankDetails
              ?.accountNumber,
          BankName:
            scheduleCheck.bookingPayment?.paymentOption?.bankDetails?.bankName,
          BranchName:
            scheduleCheck.bookingPayment?.paymentOption?.bankDetails
              ?.branchName,
          HolderPhoneNumber:
            scheduleCheck.bookingPayment?.paymentOption?.bankDetails
              ?.accountHolderPhone,
        },
      ],
    };

    const bookingConfirmationForClientEvent: ICalEventData = {
      organizer: scheduleCheck.counsellor.email,
      start: new Date(scheduleCheck.startTime),
      end: new Date(scheduleCheck.endTime),
      summary: `Counsellor session with ${scheduleCheck.counsellor.displayName}`,
      location:
        scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
          ? 'Online'
          : scheduleCheck.room[0].name,
      url: scheduleCheck?.meetingLink,
      timezone: 'UTC',
    };

    await this.notificationService
      .sendRawNotification(
        '66878f5367a4a0f353dde925',
        scheduleCheck.client.notificationType,
        [scheduleCheck.client.email],
        'Booking Confirmation',
        bookingConfirmationForClientData,
        bookingConfirmationForClientEvent,
      )
      .catch((e) => {
        console.log('e: ', e);
      });

    /**
     * Booking confirmation mail send to secondary client
     */
    if (!isEmpty(scheduleCheck.client?.secondaryEmail)) {
      const bookingConfirmationForSecondaryClientData = {
        CustomerName: scheduleCheck.client.secondaryName,
        CounsellorName: scheduleCheck.counsellor.displayName,
        BookingID: scheduleCheck._id,
        BookingDate: formatInTimeZone(
          new Date(scheduleCheck.startTime),
          scheduleCheck.meetingBooking.timezone,
          'dd MMM yyyy',
        ),
        BookingTime: `${formatInTimeZone(
          new Date(scheduleCheck.startTime),
          scheduleCheck.meetingBooking.timezone,
          'hh:mm aaaa',
        )} - ${formatInTimeZone(
          new Date(scheduleCheck.endTime),
          scheduleCheck.meetingBooking.timezone,
          'hh:mm aaaa',
        )} (${scheduleCheck.meetingBooking.timezone})`,
        BookingLocation:
          scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
            ? 'Online'
            : scheduleCheck.room[0].name,
        ContactEmail: scheduleCheck.counsellor.email,
        ContactPhone: scheduleCheck.counsellor.mobile,
        ContactInformation: 'info@umbartha.org',
        ServiceName: scheduleCheck.meetingBooking.service?.name,
        YearOngoing: formatInTimeZone(
          new Date(),
          scheduleCheck.meetingBooking.timezone,
          'yyyy',
        ),
        Online:
          scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
            ? true
            : false,
        MeetingLink: scheduleCheck?.meetingLink,
        SpecialInstruction: scheduleCheck.meeting?.specialInstruction,
        CancellationPolicy: scheduleCheck.meeting?.cancellationPolicy,
        PayPal: isNotEmpty(
          scheduleCheck.bookingPayment?.paymentOption?.payPal?.paymentLink,
        ),
        PaymentLink:
          scheduleCheck.bookingPayment?.paymentOption?.payPal?.paymentLink,
        BankTransfer: isNotEmpty(
          scheduleCheck.bookingPayment?.paymentOption?.bankDetails,
        ),
        OtherOptions: scheduleCheck.bookingPayment?.paymentOption?.otherOptions,
        BankDetails: [
          {
            HolderName:
              scheduleCheck.bookingPayment?.paymentOption?.bankDetails
                ?.accountHolderName,
            AccountNumber:
              scheduleCheck.bookingPayment?.paymentOption?.bankDetails
                ?.accountNumber,
            BankName:
              scheduleCheck.bookingPayment?.paymentOption?.bankDetails
                ?.bankName,
            BranchName:
              scheduleCheck.bookingPayment?.paymentOption?.bankDetails
                ?.branchName,
            HolderPhoneNumber:
              scheduleCheck.bookingPayment?.paymentOption?.bankDetails
                ?.accountHolderPhone,
          },
        ],
      };

      const bookingConfirmationForSecondaryClientEvent: ICalEventData = {
        organizer: scheduleCheck.counsellor.email,
        start: new Date(scheduleCheck.startTime),
        end: new Date(scheduleCheck.endTime),
        summary: `Counsellor session with ${scheduleCheck.counsellor.displayName}. Serivce: ${scheduleCheck.meetingBooking.service?.title}`,
        location:
          scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
            ? 'Online'
            : scheduleCheck.room[0].name,
        url: scheduleCheck?.meetingLink,
        timezone: 'UTC',
      };

      await this.notificationService
        .sendRawNotification(
          '66878f5367a4a0f353dde925',
          scheduleCheck.client.notificationType,
          [scheduleCheck.client.secondaryEmail],
          'Booking Confirmation',
          bookingConfirmationForSecondaryClientData,
          bookingConfirmationForSecondaryClientEvent,
        )
        .catch((e) => {
          console.log('e: ', e);
        });
    }

    /**
     * Booking corfirmation SMS to client
     */
    if (scheduleCheck.client.notificationType.sms) {
      const bookingConfirmationSMSDataForClient = {
        CancellationPolicy: scheduleCheck.meeting?.cancellationPolicy,
        CustomerName: scheduleCheck.client.name,
        ServiceName: scheduleCheck.meetingBooking.service?.name,
        AppointmentDate: formatInTimeZone(
          new Date(scheduleCheck.startTime),
          scheduleCheck.meetingBooking.timezone,
          'dd MMM yyyy',
        ),
        AppointmentTime: `${formatInTimeZone(
          new Date(scheduleCheck.startTime),
          scheduleCheck.meetingBooking.timezone,
          'hh:mm aaaa',
        )} - ${formatInTimeZone(
          new Date(scheduleCheck.endTime),
          scheduleCheck.meetingBooking.timezone,
          'hh:mm aaaa',
        )} (${scheduleCheck.meetingBooking.timezone})`,
      };

      await this.notificationService
        .sendNotification(
          '6687908b67a4a0f353dde961',
          NotificationType.SMS,
          [scheduleCheck.client.phone],
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
      ServiceName: scheduleCheck.meetingBooking.service?.name,
      CounselorName: scheduleCheck.counsellor.displayName,
      BookingID: scheduleCheck._id,
      CustomerName: scheduleCheck.client?.secondaryName
        ? scheduleCheck.client.name + ' & ' + scheduleCheck.client.secondaryName
        : scheduleCheck.client.name,
      BookingDate: formatInTimeZone(
        new Date(scheduleCheck.startTime),
        scheduleCheck.meetingBooking.timezone,
        'dd MMM yyyy',
      ),
      BookingTime: `${formatInTimeZone(
        new Date(scheduleCheck.startTime),
        scheduleCheck.meetingBooking.timezone,
        'hh:mm aaaa',
      )} - ${formatInTimeZone(
        new Date(scheduleCheck.endTime),
        scheduleCheck.meetingBooking.timezone,
        'hh:mm aaaa',
      )} (${scheduleCheck.meetingBooking.timezone})`,
      BookingLocation:
        scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
          ? 'Online'
          : scheduleCheck.room[0].name,
      ContactEmail: 'manisha@umbartha.org',
      ContactPhone: '+94 76 416 4972',
      ContactInformation: 'info@umbartha.org',
      YearOngoing: formatInTimeZone(
        new Date(),
        scheduleCheck.meetingBooking.timezone,
        'yyyy',
      ),
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
      subject: `Meeting with ${scheduleCheck.client.name}`,
      body: {
        contentType: 'HTML',
        content: `<div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Booking ID:</strong> ${
          scheduleCheck._id
        }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Client:</strong> ${
                    scheduleCheck.client?.secondaryName
                      ? scheduleCheck.client.name +
                        ' & ' +
                        scheduleCheck.client.secondaryName
                      : scheduleCheck.client.name
                  }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>ServiceName:</strong> ${
                    scheduleCheck.meetingBooking.service?.name
                  }</div>
                  <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;"><strong>Location:</strong> ${
                    scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
                      ? 'Online'
                      : scheduleCheck.room[0].name
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
        displayName:
          scheduleCheck.meetingBooking.meetingBookingType === 'ONLINE'
            ? 'Online'
            : scheduleCheck.room[0].name,
      },
      attendees: [
        {
          type: 'required',
          emailAddress: {
            name: scheduleCheck.client.name,
            address: scheduleCheck.client.email.toLowerCase(),
          },
        },
      ],
    };

    await this.calendarService
      .createScheduleMeeting(scheduleCheck.counsellor.email, calendarEvent)
      .then(async (d) => {
        await this.meetingBookingModel.findByIdAndUpdate(
          scheduleCheck.meetingBooking._id,
          { $set: { calendarEventId: d.id } },
          { new: true, lean: true },
        );
      })
      .catch((e) => {
        console.log('e: ', e);
      });

    /**
     * if Booking payment status is PAID
     */
    if (
      scheduleCheck.bookingPayment.status == BookingPaymentStatus.PAID &&
      scheduleCheck.client.notificationType.email
    ) {
      const paymentData = {
        CustomerName: scheduleCheck.client.name,
        TransactionID: scheduleCheck.bookingPayment._id,
        PaidAmount: `${scheduleCheck.bookingPayment.currency} ${scheduleCheck.bookingPayment.paid}`,
        ContactInformation: 'info@umbartha.org',
        YearOngoing: formatInTimeZone(
          new Date(),
          scheduleCheck.meetingBooking.timezone,
          'yyyy',
        ),
      };

      await this.notificationService
        .sendNotification(
          '6687902467a4a0f353dde94d',
          NotificationType.EMAIL,
          [scheduleCheck.client.email],
          'Payment Success Confirmation',
          paymentData,
        )
        .catch((e) => {
          console.log('e: ', e);
        });
    }
  }
}
