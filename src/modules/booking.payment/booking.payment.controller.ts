import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { BookingPaymentService } from './booking.payment.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  BookingPaymentParams,
  BookingPaymentQueryDto,
  PaymentStatusDto,
} from './dto/query.booking.payment.dto';
import {
  AddingCouponDto,
  AddingInstallmentDto,
} from './dto/create.booking.payment.dto';
import { User } from 'src/config/authorization/user.decorator';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';

@Controller('booking-payment/payment')
export class BookingPaymentController {
  constructor(private readonly bookingPaymentService: BookingPaymentService) {}

  @Auth('jar')
  @Get()
  async findAllBookingPayment(
    @User() user: User,
    @Query() { limit, page, _search }: PaginationQueryDto,
    @Query()
    bookingPaymentQuery: BookingPaymentQueryDto,
  ) {
    return await this.bookingPaymentService.findAll(
      _search,
      limit,
      page,
      user,
      bookingPaymentQuery,
    );
  }

  @Auth('jar')
  @Get(':bookingPaymentId')
  async findOneBookingPayment(@Param() params: BookingPaymentParams) {
    return await this.bookingPaymentService.findById(params.bookingPaymentId);
  }

  @Auth('jar')
  @Delete(':bookingPaymentId')
  async deleteBookingPayment(@Param() params: BookingPaymentParams) {
    return await this.bookingPaymentService.deleteSelectedBookingPayment(
      params.bookingPaymentId,
    );
  }

  @Auth('jar')
  @Patch(':bookingPaymentId/status')
  async bookingPaymentStatusChange(
    @Param() params: BookingPaymentParams,
    @Body() body: PaymentStatusDto,
  ) {
    return await this.bookingPaymentService.bookingPaymentStatusChange(
      params.bookingPaymentId,
      body.status,
    );
  }

  @Auth('jar')
  @Put(':bookingPaymentId')
  async addingInstallmentPayment(
    @Param() params: BookingPaymentParams,
    @Body() installment: AddingInstallmentDto,
  ) {
    return await this.bookingPaymentService.addingInstallments(
      params.bookingPaymentId,
      installment,
    );
  }

  @Auth('jar')
  @Put(':bookingPaymentId/coupon')
  async addingCoupon(
    @Param() params: BookingPaymentParams,
    @Body() coupon: AddingCouponDto,
  ) {
    return await this.bookingPaymentService.addCoupon(
      params.bookingPaymentId,
      coupon.coupon,
    );
  }

  @Auth('jar')
  @Get('dashborad/graph')
  async paymentDashboardGraph(@User() user: User) {
    return await this.bookingPaymentService.paymentGraphData(user);
  }
}
