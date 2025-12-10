import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { OrderService } from '../order/order.service';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
    ]),
    HttpModule,
    AuthenticationModule,
    BookingPaymentModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, OrderService],
})
export class WebhookModule {}
