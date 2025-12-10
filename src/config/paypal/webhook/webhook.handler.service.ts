import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import {
  BookingPayment,
  PaypalOrderStatus,
} from 'src/modules/booking.payment/schema/booking.payment.schema';

@Injectable()
export class WebhookHandlerService {
  constructor(
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
  ) {}

  async PaypalWebhookEventHandler(event) {
    let paypal: any;

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        const orderId = event.resource.id;

        paypal = {
          orderId: orderId,
          intent: event.resource.intent,
          status: event.resource.status,
          payer: {
            name: `${event.resource.payer.name.given_name} ${event.resource.payer.name.surname}`,
            email: event.resource.payer.email_address,
            payerId: event.resource.payer.payer_id,
          },
          createdAt: event.resource.create_time,
          updatedAt: event.resource.update_time,
        };

        await this.bookingPaymentModel.findOne(
          { 'paypal.orderId': orderId },
          { $set: { paypal: paypal } },
          { new: true, lean: true },
        );
        return;
      case 'CHECKOUT.ORDER.COMPLETED':
        paypal = {
          orderId: event.resource.id,
          intent: event.resource.intent,
          status: event.resource.status,
          amount: {
            value: event.resource.gross_amount.value,
            currency: event.resource.gross_amount.currency_code,
          },
          payer: {
            name: `${event.resource.payer.name.given_name} ${event.resource.payer.name.surname}`,
            email: event.resource.payer.email_address,
            payerId: event.resource.payer.payer_id,
          },
          createdAt: event.resource.create_time,
          updatedAt: event.resource.update_time,
        };

        await this.bookingPaymentModel.findOne(
          { 'paypal.orderId': orderId },
          { $set: { paypal: paypal } },
          { new: true, lean: true },
        );
        return;
      case 'PAYMENT.AUTHORIZATION.CREATED':
        const paymentId = event.resource.id;

        return;
    }

    /**
     * Handle uncaptured payments
     */
    if (event.event_type === 'CHECKOUT.PAYMENT-APPROVAL.REVERSED') {
      const orderId = event.resource.order_id;

      paypal = {
        orderId: event.resource.order_id,
        status: PaypalOrderStatus.CANCELLED,
      };

      await this.bookingPaymentModel.findOne(
        { 'paypal.orderId': orderId },
        { $set: { paypal: paypal } },
        { new: true, lean: true },
      );

      // Notify buyer of cancellation
    }
  }
}
