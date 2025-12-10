import { Module } from '@nestjs/common';
import { PublicScheduleController } from './public-schedule.controller';
import { PublicScheduleService } from './public-schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SCHEDULE_COLLECTION } from 'src/modules/schedule/schedule.constants';
import { ScheduleSchema } from 'src/modules/schedule/schema/schedule.schema';
import { ScheduleModule } from 'src/modules/schedule/schedule.module';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import { ClientSchema } from 'src/modules/client/schemas/client.schema';
import { PublicBookingPaymentModule } from '../public-booking.payment/public-booking.payment.module';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { CalendarModule } from 'src/config/microsoft-graph/calendar/calendar.module';
import { OrderModule } from 'src/config/paypal/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SCHEDULE_COLLECTION,
        schema: ScheduleSchema,
      },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
      { name: CLIENT_COLLECTION, schema: ClientSchema },
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
    ]),
    ScheduleModule,
    SESModule,
    PublicBookingPaymentModule,
    CalendarModule,
    NotificationModule,
    OrderModule,
  ],
  controllers: [PublicScheduleController],
  providers: [PublicScheduleService],
})
export class PublicScheduleModule {}
