import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, AuthenticationModule, BookingPaymentModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
