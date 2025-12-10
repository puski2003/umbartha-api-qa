import { Module } from '@nestjs/common';
import { MeetingBookingController } from './meeting.booking.controller';
import { MeetingBookingService } from './meeting.booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MEETING_BOOKING_COLLECTION } from './meeting.booking.constants';
import { MeetingBookingSchema } from './schema/meeting.booking.schema';
import { ClientModule } from '../client/client.module';
import { CounsellorModule } from '../counsellor/counsellor.module';
import { MeetingModule } from '../meeting/meeting.module';
import { LocationModule } from '../location/location.module';
import { MEETING_COLLECTION } from '../meeting/meeting.constants';
import { MeetingSchema } from '../meeting/schemas/meeting.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { SCHEDULE_COLLECTION } from '../schedule/schedule.constants';
import { ScheduleSchema } from '../schedule/schema/schedule.schema';
import { NotificationModule } from '../notification/notification.module';
import { BOOKING_PAYMENT_COLLECTION } from '../booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from '../booking.payment/schema/booking.payment.schema';
import { CalendarModule } from 'src/config/microsoft-graph/calendar/calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: MEETING_COLLECTION, schema: MeetingSchema },
      { name: SCHEDULE_COLLECTION, schema: ScheduleSchema },
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
    ]),
    ClientModule,
    CounsellorModule,
    MeetingModule,
    LocationModule,
    SESModule,
    NotificationModule,
    CalendarModule,
  ],
  controllers: [MeetingBookingController],
  providers: [MeetingBookingService],
  exports: [MeetingBookingService],
})
export class MeetingBookingModule {}
