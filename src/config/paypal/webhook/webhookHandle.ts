import { OrderService } from '../order/order.service';

export const handleWebhookEvent = async (payload: any, orderService: OrderService) => {
  let orderId: string | null = null, eventId: string, transactionId: string;
  switch (payload.event_type) {
    case 'CHECKOUT.ORDER.APPROVED':
      orderId = payload.resource.id;
      eventId = payload.id;
      return { orderId, eventId };

    case 'PAYMENT.CAPTURE.COMPLETED':
      eventId = payload.id;
      if (
        payload.resource.supplementary_data &&
        payload.resource.supplementary_data.related_ids
      ) {
        orderId = payload.resource.supplementary_data.related_ids.order_id;
      }

      if (!orderId) {
        console.log(
          'No orderId found in the capture event. Cannot categorize event.',
        );
        return;
      }
      return { orderId, eventId };

    case 'PAYMENT.AUTHORIZATION.VOIDED':
      orderId = payload.resource.order_id;
      transactionId = payload.resource.id;
      eventId = payload.id;
      if (!orderId) {
        console.log(
          'No orderId found in the capture event. Cannot categorize event.',
        );
        return;
      }
      return { orderId, eventId, transactionId };

    case 'PAYMENT.CAPTURE.DENIED':
      eventId = payload.id;
      const parentPaymentId = payload.resource.parent_payment;

      if (parentPaymentId) {
        // orderId = await orderService.getOrderFromPayment(
        //   parentPaymentId,
        // );

        // if (orderId) {
        //   console.log('Order found: ', orderId);
        // } else {
        //   console.log('No orderId found for the parent payment.');
        // }
      }
      return { orderId, eventId };

    default:
      throw new Error(`Unhandled event: ${payload.event_type}`);
  }
};

