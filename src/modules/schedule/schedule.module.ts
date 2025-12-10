import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SCHEDULE_COLLECTION } from './schedule.constants';
import { ScheduleSchema } from './schema/schedule.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';
import { CLIENT_COLLECTION } from '../client/client.constants';
import { ClientSchema } from '../client/schemas/client.schema';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { SMSModule } from 'src/config/sms/sms.module';
import { NotificationModule } from '../notification/notification.module';
import { BOOKING_PAYMENT_COLLECTION } from '../booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from '../booking.payment/schema/booking.payment.schema';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from '../meeting.booking/schema/meeting.booking.schema';
import { CalendarModule } from 'src/config/microsoft-graph/calendar/calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SCHEDULE_COLLECTION,
        schema: ScheduleSchema,
      },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: CLIENT_COLLECTION, schema: ClientSchema },
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
    ]),
    SESModule,
    SMSModule,
    CalendarModule,
    NotificationModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
