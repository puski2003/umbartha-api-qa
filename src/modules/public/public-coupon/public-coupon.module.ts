import { Module } from '@nestjs/common';
import { PublicCouponController } from './public-coupon.controller';
import { PublicCouponService } from './public-coupon.service';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';

@Module({
  imports: [BookingPaymentModule],
  controllers: [PublicCouponController],
  providers: [PublicCouponService],
})
export class PublicCouponModule {}
