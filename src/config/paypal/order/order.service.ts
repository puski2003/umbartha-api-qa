import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { BookingPaymentService } from 'src/modules/booking.payment/booking.payment.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpService } from '@nestjs/axios';
import { OrderCreateI } from './order.types';
import { isNotEmpty } from 'class-validator';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly authenticationService: AuthenticationService,
    private readonly bookingPaymentService: BookingPaymentService,
  ) {
    this.httpService.axiosRef.defaults.baseURL =
      'https://api-m.sandbox.paypal.com';
  }

  private async handleResponse(response: Response) {
    try {
      const jsonResponse = await response.json();
      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } catch (err) {
      const ErrorMessage = await response.text();
      throw new HttpException(ErrorMessage, response.status);
    }
  }

  /**
   * create order
   */
  async createOrder(order: OrderCreateI): Promise<any> {
    const accessToken = await this.authenticationService.getToken();

    try {
      const res = await this.httpService.axiosRef.post(
        'v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                value: order.price,
                currency_code: order.currencyCode,
              },
              payee: {
                ...(isNotEmpty(order?.merchantId)
                  ? {
                      merchant_id: order.merchantId,
                    }
                  : {
                      email_address: order.email,
                    }),
              },
            },
          ],
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      return res.data;
    } catch (e) {
      console.error('error: ', e);
      throw new BadRequestException(e.message);
    }
    // const { jsonResponse } = await this.handleResponse(response);
    // const orderID = jsonResponse.id;
    // console.log('Order Created. orderID : ', orderID);
    // console.log('booking payment id ', createOrderDto.bookingPayment);

    // const createOrderDetails = {
    //   orderId: jsonResponse.id,
    //   createTime: jsonResponse.create_time,
    //   status: jsonResponse.status,
    //   // approveUrl: jsonResponse.links.find((link) => link.rel === 'approve')
    //   //   .href,
    // };
    // this.bookingPaymentId = createOrderDto.bookingPayment;
    // await this.BookingPaymentService.updatePaymentWithPaypal(
    //   this.bookingPaymentId,
    //   createOrderDetails,
    // );
    // console.log('booking payment id: ', this.bookingPaymentId);
    // console.log('create order details :', createOrderDetails);
    // return jsonResponse;
  }

  async getOrderFromPayment(parentPaymentId: string): Promise<string | null> {
    const accessToken = await this.authenticationService.getToken();

    const url = `https://api-m.sandbox.paypal.com/v1/payments/payment/${parentPaymentId}`;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    let retryCount = 0;
    const maxRetries = 3;
    while (retryCount < maxRetries) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, { headers }),
        );
        const transactions = response.data.transactions;
        if (
          transactions &&
          transactions.length > 0 &&
          transactions[0].related_resources
        ) {
          const relatedResources = transactions[0].related_resources;
          const order = relatedResources.find((resource) => resource.order);
          return order ? order.order.id : null;
        }
        return null;
      } catch (error) {
        retryCount++;
        console.error(
          `Error fetching payment details (Attempt ${retryCount}):`,
          error,
        );
        if (retryCount >= maxRetries || error.response?.status !== 503) {
          return null;
        }
        // Optionally wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  /**
   * capture order
   */
  async captureOrder(order: string): Promise<any> {
    const accessToken = await this.authenticationService.getToken();

    try {
      const res = await this.httpService.axiosRef.post(
        `/v2/checkout/orders/${order}/capture`,
        '',
        {
          headers: {
            'Content-Type': 'Application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return res.data;
    } catch (e) {
      console.error('e: ', e);
      throw new BadRequestException(e.message);
    }

    // const captureorderDetails = {
    //   captureId: jsonResponse.id,
    //   status: jsonResponse.status,
    //   amount: jsonResponse.purchase_units[0].payments.captures[0].amount.value,
    //   currency:
    //     jsonResponse.purchase_units[0].payments.captures[0].amount
    //       .currency_code,
    //   payer: jsonResponse.payment_source
    //     ? [jsonResponse.payment_source.paypal]
    //     : [],
    // };
    // const id = this.bookingPaymentId;
    // if (!id) {
    //   throw new Error('Order ID from createOrder is not found');
    // }
    // await this.BookingPaymentService.updatePaymentWithPaypal(
    //   id,
    //   captureorderDetails,
    // );
    // console.log('capture order details ', captureorderDetails);
    // return jsonResponse;
  }

  //Ui should send a onApprove, create a testing one
  // async captureOrder(orderID: string): Promise<any> {
  //   console.log('capturing order ', orderID);
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${Base_url}/v2/checkout/orders/${orderID}/capture`;
  //   const response = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const { jsonResponse } = await this.handleResponse(response);
  //   console.log('Order Captured: ', jsonResponse);

  //   const captureorderDetails = {
  //     captureId: jsonResponse.id,
  //     status: jsonResponse.status,
  //     amount: jsonResponse.purchase_units[0].payments.captures[0].amount.value,
  //     currency:
  //       jsonResponse.purchase_units[0].payments.captures[0].amount
  //         .currency_code,
  //     payer: jsonResponse.payment_source
  //       ? [jsonResponse.payment_source.paypal]
  //       : [],
  //   };
  //   const id = this.bookingPaymentId;
  //   if (!id) {
  //     throw new Error('Order ID from createOrder is not found');
  //   }
  //   await this.BookingPaymentService.updatePaymentWithPaypal(
  //     id,
  //     captureorderDetails,
  //   );
  //   console.log('capture order details ', captureorderDetails);
  //   return jsonResponse;
  // }

  // get a details of a "CREATED" order
  // async orderDetails(orderID: string): Promise<any> {
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${Base_url}/v2/checkout/orders/${orderID}`;
  //   // const url = `${Base_url}/checkoutnow?token=${orderID}`;
  //   const response = await fetch(url, {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const jsonResponse = await this.handleResponse(response);
  //   console.log(`Order ${orderID} details: `, jsonResponse);
  // }

  // 2. confirm the order (dev-test)
  // async confirmOrder(orderID: string): Promise<any> {
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${Base_url}/v2/checkout/orders/${orderID}/confirm-payment-source`;

  //   const payload = {
  //     payment_source: {
  //       paypal: {
  //         name: {
  //           given_name: 'XXX',
  //           surname: 'Doe',
  //         },
  //         email_address: 'sb-isb47d32637204@personal.example.com',
  //       },
  //     },
  //   };

  //   const response = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //     body: JSON.stringify(payload),
  //   });
  //   const { jsonResponse } = await this.handleResponse(response);
  //   console.log('Order Confirmed: ', jsonResponse.status);
  //   return jsonResponse;
  // }

  // 3. Authorize the payment
  // async authorizeOrder(orderID: string): Promise<any> {
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${Base_url}/v2/checkout/orders/${orderID}/authorize`;

  //   const response = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const { jsonResponse } = await this.handleResponse(response);
  //   console.log('Order authorized: ', jsonResponse.status);
  //   return jsonResponse;
  // }

  //onCancel
  // async onCancel(HandleCancelDto: HandleCancelDto): Promise<any> {
  //   const { orderId, reason } = HandleCancelDto;

  //   const bookingPayment = await this.bookingPaymentModel.findOne({
  //     'paypal.orderId': orderId,
  //   });

  //   if (!bookingPayment) {
  //     throw new NotFoundException(
  //       `booking payment not found for id ${orderId}`,
  //     );
  //   } else {
  //     console.log('booking payment found', bookingPayment.id);
  //   }

  //   const status = 'CANCELED';

  //   await this.bookingPaymentModel.updateOne(
  //     { _id: bookingPayment.id },
  //     {
  //       $set: { 'paypal.status': status },
  //       $push: {
  //         'paypal.cancel_data': { reason: reason, timeStamp: new Date() },
  //       },
  //     },
  //     { new: true },
  //   );

  //   return {
  //     message: 'Order cancellation recorded',
  //     orderId,
  //     status,
  //   };
}
