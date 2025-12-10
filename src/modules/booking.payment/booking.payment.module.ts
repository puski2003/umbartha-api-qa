import { Module } from '@nestjs/common';
import { BookingPaymentService } from './booking.payment.service';
import { BookingPaymentController } from './booking.payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BOOKING_PAYMENT_COLLECTION } from './booking.payment.constants';
import { BookingPaymentSchema } from './schema/booking.payment.schema';
import { ClientModule } from '../client/client.module';
import { CounsellorModule } from '../counsellor/counsellor.module';
import { MeetingModule } from '../meeting/meeting.module';
import { LocationModule } from '../location/location.module';
import { CouponModule } from '../coupon/coupon.module';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';
import { MEETING_COLLECTION } from '../meeting/meeting.constants';
import { MeetingSchema } from '../meeting/schemas/meeting.schema';
import { PaymentOptionModule } from '../payment.option/payment.option.module';
import { NotificationModule } from '../notification/notification.module';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from '../meeting.booking/schema/meeting.booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: MEETING_COLLECTION, schema: MeetingSchema },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
    ]),
    ClientModule,
    CounsellorModule,
    MeetingModule,
    LocationModule,
    PaymentOptionModule,
    CouponModule,
    NotificationModule,
  ],
  providers: [BookingPaymentService],
  controllers: [BookingPaymentController],
  exports: [BookingPaymentService],
})
export class BookingPaymentModule {}
