import { Module } from '@nestjs/common';
import { PublicBookingPaymentService } from './public-booking.payment.service';
import { PublicBookingPaymentController } from './public-booking.payment.controller';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { COUNSELLOR_RATE_COLLECTION } from 'src/modules/counsellor.rate/counsellor.rate.constants';
import { CounsellorRateSchema } from 'src/modules/counsellor.rate/schema/counsellor.rate.schema';
import { SheetApiModule } from 'src/config/google/sheet-api/sheet-api.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
      { name: COUNSELLOR_RATE_COLLECTION, schema: CounsellorRateSchema },
    ]),
    BookingPaymentModule,
    SheetApiModule,
  ],
  controllers: [PublicBookingPaymentController],
  providers: [PublicBookingPaymentService],
  exports: [PublicBookingPaymentService],
})
export class PublicBookingPaymentModule {}
