import { Injectable } from '@nestjs/common';
import { BookingPaymentService } from 'src/modules/booking.payment/booking.payment.service';

@Injectable()
export class PublicCouponService {
  constructor(private readonly bookingPaymentService: BookingPaymentService) {}

  async couponAdding(couponName: string, bookingPaymentId: string) {
    return await this.bookingPaymentService.addCoupon(
      bookingPaymentId,
      couponName,
    );
  }
}
