import { Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { NotificationType } from './schema/notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SESService } from 'src/config/aws/aws-ses/service';
import Handlebars from 'handlebars';
import { NotificationTemplateService } from '../notification.template/notification.template.service';
import { SMSService } from 'src/config/sms/sms.service';
import { ICalCalendar, ICalEventData } from 'ical-generator';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import {
  MeetingBooking,
  MeetingBookingStatus,
} from '../meeting.booking/schema/meeting.booking.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { endOfDay, format, startOfDay } from 'date-fns';
import { isNotEmpty } from 'class-validator';
import { CLIENT_COLLECTION } from '../client/client.constants';
import { Client } from '../client/schemas/client.schema';
import { formatInTimeZone } from 'date-fns-tz';
import { NotificationTypes } from './notification.types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ct = require('countries-and-timezones');

@Injectable()
export class NotificationService {
  private calendar: ICalCalendar;

  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly sesService: SESService,
    private readonly smsService: SMSService,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    @InjectModel(CLIENT_COLLECTION) private readonly clientModel: Model<Client>,
  ) {
    this.calendar = new ICalCalendar();
  }

  async counsellorDailyReminder() {
    const today = new Date();
    const startDay = startOfDay(today);
    const endDay = endOfDay(today);

    const _650oClock = new Date(new Date().setHours(1, 20, 0, 0));
    const _710oClock = new Date(new Date().setHours(1, 40, 0, 0));

    try {
      if (
        _650oClock.getTime() <= today.getTime() &&
        today.getTime() <= _710oClock.getTime()
      ) {
        const counsellorCheck = await this.counsellorModel.find().lean();

        for (const counsellor of counsellorCheck) {
          const country = ct.getCountry(counsellor.country);
          const timeZone = country.timezones[0];

          const meetingBookingCheck: any = await this.meetingBookingModel
            .find({
              counsellor: new Types.ObjectId(counsellor._id),
              timeFrom: { $gte: startDay, $lte: endDay },
              status: MeetingBookingStatus.PROCESSING,
            })
            .populate('counsellor client room')
            .lean();

          if (isNotEmpty(meetingBookingCheck[0])) {
            const counsellorBookingDetails = [];

            for (const meetingBooking of meetingBookingCheck) {
              counsellorBookingDetails.push({
                ClientID: meetingBooking.client.name,
                BookingDate: `${formatInTimeZone(
                  new Date(meetingBooking.timeFrom),
                  timeZone,
                  'dd MMM yyyy',
                )}`,
                BookingTime: `${formatInTimeZone(
                  new Date(meetingBooking.timeFrom),
                  timeZone,
                  'hh:mm aaaa',
                )} - ${formatInTimeZone(
                  new Date(meetingBooking.timeTo),
                  timeZone,
                  'hh:mm aaaa',
                )}`,
                BookingLocation: meetingBooking.room
                  ? meetingBooking.room.name
                  : 'Online',
              });
            }

            const dailyReminderEmailData = {
              CounselorName: counsellor.displayName,
              Session: counsellorBookingDetails,
              ContactEmail: counsellor.email,
              ContactPhone: counsellor.mobile,
              ContactInformation: 'manisha@umbartha.org',
              YearOngoing: `${new Date().getFullYear()}`,
            };

            await this.sendNotification(
              '66878fa167a4a0f353dde934',
              NotificationType.EMAIL,
              [counsellor.email],
              'Daily Reminder',
              dailyReminderEmailData,
            );

            const dailyReminderSMSData = {
              CounselorName: counsellor.displayName,
              NumberofSessions: meetingBookingCheck.length,
            };

            await this.sendNotification(
              '668790c767a4a0f353dde96b',
              NotificationType.SMS,
              [counsellor.hotline],
              'Daily Reminder',
              dailyReminderSMSData,
            );
          }
        }
      }
    } catch (e) {
      console.log('error: ', e);
    }
  }

  async clientReminder() {
    try {
      const clientsCheck = await this.clientModel.find().lean();

      for (const client of clientsCheck) {
        const country = ct.getCountry(client.country);
        const timezone = country.timezones[0];

        const meetingBookingCheckFor24hBefore: any =
          await this.meetingBookingModel
            .findOne({
              status: MeetingBookingStatus.PROCESSING,
              client: new Types.ObjectId(client._id),
              timeFrom: {
                $gte: new Date(
                  new Date().getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000,
                ),
                $lte: new Date(
                  new Date().getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000,
                ),
              },
            })
            .populate('counsellor meeting client room');

        if (isNotEmpty(meetingBookingCheckFor24hBefore)) {
          if (client?.notificationType?.email) {
            const clientSessionReminder24hEmail = {
              CustomerName: meetingBookingCheckFor24hBefore.client.name,
              CounselorName:
                meetingBookingCheckFor24hBefore.counsellor.displayName,
              BookingID: meetingBookingCheckFor24hBefore._id,
              BookingDate: formatInTimeZone(
                new Date(meetingBookingCheckFor24hBefore.timeFrom),
                timezone,
                'dd MMM yyyy',
              ),
              BookingTime: `${formatInTimeZone(
                new Date(meetingBookingCheckFor24hBefore.timeFrom),
                timezone,
                'hh:mm aaaa',
              )} - ${formatInTimeZone(
                new Date(meetingBookingCheckFor24hBefore.timeTo),
                timezone,
                'hh:mm aaaa',
              )} (${timezone})`,
              BookingLocation: meetingBookingCheckFor24hBefore.room
                ? meetingBookingCheckFor24hBefore.room.name
                : 'Online',
              CancellationPolicy:
                meetingBookingCheckFor24hBefore.meeting?.cancellationPolicy,
              ContactEmail: meetingBookingCheckFor24hBefore.counsellor.email,
              ContactPhone: meetingBookingCheckFor24hBefore.counsellor.mobile,
              ContactInformation: 'info@umbartha.org',
              YearOngoing: formatInTimeZone(new Date(), timezone, 'yyyy'),
            };

            await this.sendNotification(
              '6687906267a4a0f353dde957',
              NotificationType.EMAIL,
              [meetingBookingCheckFor24hBefore.client.email],
              'Session Reminder',
              clientSessionReminder24hEmail,
            );
          }

          if (client?.notificationType?.sms) {
            const clientSessionReminder24hSMS = {
              CustomerName: meetingBookingCheckFor24hBefore.client.name,
              AppointmentTime: `${formatInTimeZone(
                new Date(meetingBookingCheckFor24hBefore.timeFrom),
                timezone,
                'hh:mm aaaa',
              )} - ${formatInTimeZone(
                new Date(meetingBookingCheckFor24hBefore.timeTo),
                timezone,
                'hh:mm aaaa',
              )} (${timezone})`,
            };

            await this.sendNotification(
              '668790fe67a4a0f353dde975',
              NotificationType.SMS,
              [meetingBookingCheckFor24hBefore.client.phone],
              'Session Reminder',
              clientSessionReminder24hSMS,
            );
          }
        }

        const meetingBookingCheckFor48hBefore: any =
          await this.meetingBookingModel
            .findOne({
              status: MeetingBookingStatus.PROCESSING,
              client: new Types.ObjectId(client._id),
              timeFrom: {
                $gte: new Date(
                  new Date().getTime() + 47 * 60 * 60 * 1000 + 50 * 60 * 1000,
                ),
                $lte: new Date(
                  new Date().getTime() + 48 * 60 * 60 * 1000 + 10 * 60 * 1000,
                ),
              },
            })
            .populate('counsellor meeting client room');

        if (
          isNotEmpty(meetingBookingCheckFor48hBefore) &&
          client?.notificationType?.email
        ) {
          const clientSessionReminder48hEmail = {
            CustomerName: meetingBookingCheckFor48hBefore.client.name
              .split(' ')
              .filter((word: string) => word.trim() !== '')
              .map((word: string) => {
                return word[0].toUpperCase() + word.slice(1).toLowerCase();
              })
              .join(' '),
            CounselorName:
              meetingBookingCheckFor48hBefore.counsellor.displayName
                .split(' ')
                .filter((word: string) => word.trim() !== '')
                .map((word: string) => {
                  return word[0].toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' '),
            BookingID: meetingBookingCheckFor48hBefore._id,
            BookingDate: formatInTimeZone(
              new Date(meetingBookingCheckFor48hBefore.timeFrom),
              timezone,
              'dd MMM yyyy',
            ),
            BookingTime: `${formatInTimeZone(
              new Date(meetingBookingCheckFor48hBefore.timeFrom),
              timezone,
              'hh:mm aaaa',
            )} - ${formatInTimeZone(
              new Date(meetingBookingCheckFor48hBefore.timeTo),
              timezone,
              'hh:mm aaaa',
            )} (${timezone})`,
            BookingLocation: meetingBookingCheckFor48hBefore.room
              ? meetingBookingCheckFor48hBefore.room.name
                  .split(' ')
                  .filter((word: string) => word.trim() !== '')
                  .map((word: string) => {
                    return word[0].toUpperCase() + word.slice(1).toLowerCase();
                  })
                  .join(' ')
              : 'Online',
            CancellationPolicy:
              meetingBookingCheckFor48hBefore.meeting?.cancellationPolicy,
            ContactEmail: meetingBookingCheckFor48hBefore.counsellor.email,
            ContactPhone: meetingBookingCheckFor48hBefore.counsellor.mobile,
            ContactInformation: 'info@umbartha.org',
            YearOngoing: formatInTimeZone(new Date(), timezone, 'yyyy'),
          };

          await this.sendNotification(
            '66b36be396b8915fc6fef649',
            NotificationType.EMAIL,
            [meetingBookingCheckFor48hBefore.client.email],
            'Session Reminder',
            clientSessionReminder48hEmail,
          );
        }
      }
    } catch (e) {
      console.log('error: ', e);
    }
  }

  async sendNotification(
    templateId: string,
    notificationType: string,
    receiver: string[],
    subject: string,
    data: object,
    bccReceiver?: string[],
    sender = 'no-reply@umbartha.org',
  ) {
    const templateCheck = await this.notificationTemplateService.findById(
      templateId,
    );

    const source = templateCheck.template.templateData;
    const template = Handlebars.compile(source.toString());

    if (notificationType === NotificationType.EMAIL) {
      const mail = {
        toAddresses: receiver,
        bccAddresses: bccReceiver,
        htmlData: template(data).toString(),
        subject: subject,
        source: sender,
      };

      Logger.verbose('Sending email by SES...', `${subject.toUpperCase()}`);
      await this.sesService.sendEmail(mail);
      Logger.verbose('Email sent successfully', `${subject.toUpperCase()}}`);
    } else if (notificationType === NotificationType.SMS) {
      Logger.verbose(
        'Sending sms by Notify or twilio...',
        `${subject.toUpperCase()}`,
      );
      await this.smsService.sendTemplateSMS(
        receiver[0],
        template(data)
          .toString()
          .replace(/<[^>]+>/g, ' '),
      );
      Logger.verbose('SMS sent successfully', `${subject.toUpperCase()}}`);
    }
  }

  async sendRawNotification(
    templateId: string,
    notificationType: NotificationTypes,
    receiver: string[],
    subject: string,
    data: object,
    event: ICalEventData,
    sender = 'no-reply@umbartha.org',
  ) {
    if (notificationType.email === true) {
      const templateCheck = await this.notificationTemplateService.findById(
        templateId,
      );

      const source = templateCheck.template.templateData;
      const template = Handlebars.compile(source.toString());

      const calendar = this.calendar.name(subject);

      calendar.createEvent(event);

      const mail = {
        toAddresses: receiver,
        htmlData: template(data).toString(),
        subject: subject,
        source: sender,
        fileName: subject.toLocaleLowerCase().split(' ').join('_'),
        file: calendar.toString(),
      };

      Logger.verbose('Sending raw email by SES...', `${subject.toUpperCase()}`);
      await this.sesService.sendRawEmail(mail);
      Logger.verbose(
        'Raw Email sent successfully',
        `${subject.toUpperCase()}}`,
      );
    }
  }
}
