import { Body, Controller, Post } from '@nestjs/common';
import { PublicCouponService } from './public-coupon.service';
import { CouponGetParam } from './dto/public-coupon.dto';

@Controller('public/coupon')
export class PublicCouponController {
  constructor(private readonly publicCouponService: PublicCouponService) {}

  @Post()
  async addCoupon(@Body() params: CouponGetParam) {
    return await this.publicCouponService.couponAdding(
      params.couponName,
      params.bookingPayment,
    );
  }
}
