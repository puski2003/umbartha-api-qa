import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { RequestCouponDto } from './dto/create.coupon.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  CouponName,
  CouponParam,
  PaginationQueryDto,
} from './dto/query.coupon.dto';
import { UpdateCouponDto } from './dto/update.coupon.dto';
import { User } from 'src/config/authorization/user.decorator';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth('jar')
  @Get()
  async findAllCoupons(
    @User() user: User,
    @Query() { limit, page }: PaginationQueryDto,
  ) {
    return await this.couponService.findAllCoupons(user, limit, page);
  }

  @Auth('jar')
  @Get(':couponId')
  async findOneCoupon(@Param() params: CouponParam) {
    return await this.couponService.findSelectedCoupon(params.couponId);
  }

  @Auth('jar')
  @Post()
  async creteCoupon(
    @User() user: User,
    @Body() requestCouponDto: RequestCouponDto,
  ) {
    return await this.couponService.createCoupon(user, requestCouponDto);
  }

  @Auth('jar')
  @Patch(':couponId')
  async updateCoupon(
    @Param() params: CouponParam,
    @Body() coupon: UpdateCouponDto,
  ) {
    return await this.couponService.updateSelectedCoupon(
      params.couponId,
      coupon,
    );
  }

  @Auth('jar')
  @Delete(':couponId')
  async deleteCoupon(@Param() params: CouponParam) {
    return await this.couponService.deleteSelectedCoupon(params.couponId);
  }

  @Get('coupon-name/:couponName')
  async findCouponBydName(@Param() params: CouponName) {
    return await this.couponService.findByCouponName(params.couponName);
  }

  @Auth('jar')
  @Patch('coupon-name/:couponName/used-on')
  async useCoupon(@Param() params: CouponName) {
    return await this.couponService.couponUse(params.couponName);
  }
}
