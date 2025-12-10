import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crc32 from 'buffer-crc32';
import * as fs from 'fs/promises';
import { isEmpty, isNotEmpty } from 'class-validator';
import * as crypto from 'crypto';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPayment } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { handleWebhookEvent } from './webhookHandle';
import { OrderService } from '../order/order.service';

@Injectable()
export class WebhookService {
  private readonly webhookID: string;
  private readonly cacheDir: string;

  constructor(
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    private readonly orderService: OrderService,
  ) {
    this.webhookID = '41K265294V481370F';
    this.cacheDir = '.';
  }

  async webhookListener(req: Request) {
    try {
      const payload = req.body;
      const transmissionID = req.headers['paypal-transmission-id'].toString();
      const transmissionTime =
        req.headers['paypal-transmission-time'].toString();
      const certURL = req.headers['paypal-cert-url'].toString();
      const transmissionSig = req.headers['paypal-transmission-sig'].toString();
      const correlationId = req.headers?.['correlation-id'];

      const isSignatureValid = await this.verifySignature(
        transmissionID,
        transmissionTime,
        payload,
        certURL,
        transmissionSig,
      );
      console.log('event ', req.body);

      if (!isSignatureValid)
        throw new BadRequestException(
          `Signature is not valid for ${payload?.id} ${correlationId}`,
        );
      console.log('Signature is valid.');
      console.log('Payload', payload);

      // Call the helper function to categorize the event and get the relevant IDs
      const { orderId, transactionId, eventId } = await handleWebhookEvent(
        payload,
        this.orderService,
      );
      console.log('orderId: ', { orderId });

      const webhookEvent = {
        id: eventId,
        event_type: payload.event_type,
        summary: payload.summary,
        resource: {
          id: payload.resource.id,
          status: payload.resource.status,
          amount: payload.resource.amount?.total,
        },
        created_at: new Date(payload.create_time),
      };

      const updateResult = await this.bookingPaymentModel.updateOne(
        {
          'paypal.orderId': orderId,
        },
        {
          $push: { 'paypal.webhook': webhookEvent },
        },
        { new: true },
      );

      if (!updateResult) {
        console.log(
          `Event ${eventId} already exists or no matching booking found.`,
        );
        return;
      }
      console.log(
        `Stored webhook event ${eventId} for order ${orderId || transactionId}`,
      );
    } catch (e) {
      console.log('error processing webhook: ', e);
    }
  }

  async verifySignature(
    transmissionId: string,
    timeStamp: string,
    event: object,
    certURL: string,
    transmissionSig: string,
  ) {
    const crc = parseInt(
      '0x' + crc32(Buffer.from(JSON.stringify(event))).toString('hex'),
    );

    const message = `${transmissionId}|${timeStamp}|${this.webhookID}|${crc}`;
    console.log(`Original signed message ${message}`);

    const certPem = await this.downloadAndCache(certURL);

    const signatureBuffer = Buffer.from(transmissionSig, 'base64');

    const verifier = crypto.createVerify('SHA256');

    verifier.update(message);

    return verifier.verify(certPem, signatureBuffer);
  }

  async downloadAndCache(url: string, cacheKey?: string) {
    if (isEmpty(cacheKey)) cacheKey = url.replace(/\W+/g, '-');

    const filePath = `${this.cacheDir}/${cacheKey}`;

    const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (isNotEmpty(cachedData)) return cachedData;

    const response = await fetch(url);
    const data = await response.text();
    await fs.writeFile(filePath, data);

    return data;
  }
}
