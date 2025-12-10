import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { BookingPaymentService } from 'src/modules/booking.payment/booking.payment.service';
import { PublicBookingPaymentService } from './public-booking.payment.service';
import {
  BookingPaymentParams,
  PaymentOptionDto,
} from './dto/public-booking.payment.dto';

@Controller('public/booking-payment')
export class PublicBookingPaymentController {
  constructor(
    private readonly publicBookingPaymentService: PublicBookingPaymentService,
    private readonly bookingPaymentService: BookingPaymentService,
  ) {}

  @Get(':bookingPaymentId')
  async getPayment(@Param() params: BookingPaymentParams) {
    return await this.bookingPaymentService.findById(params.bookingPaymentId);
  }

  @Patch(':bookingPaymentId/payment-option')
  async updatedPaymentOption(
    @Param() params: BookingPaymentParams,
    @Body() paymentOption: PaymentOptionDto,
  ) {
    return await this.publicBookingPaymentService.updatePaymentMethod(
      params.bookingPaymentId,
      paymentOption.paymentOption,
    );
  }
}
