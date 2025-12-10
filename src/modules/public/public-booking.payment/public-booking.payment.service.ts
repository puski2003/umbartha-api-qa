import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty, isNotEmpty } from 'class-validator';
import { Model, Types } from 'mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import {
  BookingPayment,
  BookingPaymentStatus,
} from 'src/modules/booking.payment/schema/booking.payment.schema';
import { COUNSELLOR_RATE_COLLECTION } from 'src/modules/counsellor.rate/counsellor.rate.constants';
import { CounsellorRate } from 'src/modules/counsellor.rate/schema/counsellor.rate.schema';
import * as CC from 'currency-converter-lt';
import { SheetApiService } from 'src/config/google/sheet-api/sheet-api.service';

const T = {
  bookingPaymentNotFound: 'booking payment is not found',
};

@Injectable()
export class PublicBookingPaymentService {
  private currencyConverter;

  constructor(
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    @InjectModel(COUNSELLOR_RATE_COLLECTION)
    private readonly rateModel: Model<CounsellorRate>,
    private readonly sheetApiService: SheetApiService,
  ) {
    this.currencyConverter = new CC();
  }

  async findBydId(bookingPaymentId: string) {
    const bookingPaymentCheck = await this.bookingPaymentModel
      .findById(bookingPaymentId)
      .lean()
      .populate([
        { path: 'client', select: 'name phone email' },
        {
          path: 'counsellor',
          select:
            'profilePictureURL title displayName specialization email mobile hotline',
        },
        { path: 'meeting', select: 'meetingType internalName description' },
        { path: 'room', select: 'name' },
        { path: 'paymentOption', select: 'name description' },
        { path: 'installments.paymentMethod', select: 'name description' },
        { path: 'installments.coupon', select: 'name discountType amount' },
      ]);

    if (isEmpty(bookingPaymentCheck)) {
      throw new NotFoundException(T.bookingPaymentNotFound);
    }
    return bookingPaymentCheck;
  }

  async updatePaymentMethod(bookingPaymentId: string, paymentOption: string) {
    await this.findBydId(bookingPaymentId);

    const updatedBookingPayment =
      await this.bookingPaymentModel.findByIdAndUpdate(
        bookingPaymentId,
        { $set: { paymentOption: new Types.ObjectId(paymentOption) } },
        { new: true, lean: true },
      );
    return updatedBookingPayment;
  }

  async createBookingPayment(bookingPayment: any) {
    const meetingTime =
      (new Date(bookingPayment.endTime).getTime() -
        new Date(bookingPayment.startTime).getTime()) /
      3600000;

    let rateCheck = await this.rateModel
      .findOne({
        counsellor: new Types.ObjectId(bookingPayment.counsellor),
        ...(isNotEmpty(bookingPayment.service)
          ? { service: new Types.ObjectId(bookingPayment.service) }
          : {}),
        hourFrom: 0,
        hourTo: meetingTime,
        country: bookingPayment.country,
        nationality: bookingPayment.nationality,
      })
      .lean()
      .then(async (d) => {
        if (isEmpty(d))
          return await this.rateModel.findOne({
            counsellor: new Types.ObjectId(bookingPayment.counsellor),
            hourFrom: 0,
            hourTo: meetingTime,
            country: bookingPayment.country,
            nationality: bookingPayment.nationality,
          });

        return d;
      });

    if (isEmpty(rateCheck)) {
      let defaultRate = await this.rateModel
        .findOne({
          counsellor: new Types.ObjectId(bookingPayment.counsellor),
          ...(isNotEmpty(bookingPayment.service)
            ? { service: new Types.ObjectId(bookingPayment.service) }
            : {}),
          hourFrom: 0,
          hourTo: meetingTime,
          defaultRate: true,
        })
        .lean();

      if (isNotEmpty(defaultRate)) {
        rateCheck = await this.rateModel
          .findOne({
            counsellor: new Types.ObjectId(bookingPayment.counsellor),
            ...(isNotEmpty(bookingPayment.service)
              ? { service: new Types.ObjectId(bookingPayment.service) }
              : {}),
            hourFrom: 0,
            hourTo: meetingTime,
            country: defaultRate.country,
            nationality: bookingPayment.nationality,
          })
          .lean();

        if (isEmpty(rateCheck))
          rateCheck = await this.rateModel
            .findOne({
              counsellor: new Types.ObjectId(bookingPayment.counsellor),
              hourFrom: 0,
              hourTo: meetingTime,
              country: defaultRate.country,
              nationality: bookingPayment.nationality,
            })
            .lean();
      } else {
        defaultRate = await this.rateModel
          .findOne({
            counsellor: new Types.ObjectId(bookingPayment.counsellor),
            hourFrom: 0,
            hourTo: meetingTime,
            defaultRate: true,
          })
          .lean();

        if (isNotEmpty(defaultRate))
          rateCheck = await this.rateModel
            .findOne({
              counsellor: new Types.ObjectId(bookingPayment.counsellor),
              hourFrom: 0,
              hourTo: meetingTime,
              country: defaultRate.country,
              nationality: bookingPayment.nationality,
            })
            .lean();
      }

      rateCheck = rateCheck || defaultRate;
    }

    if (isEmpty(rateCheck))
      throw new BadRequestException('rate is not define for this meeting');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const currencyCode = require('country-to-currency');
    let clientCurrencyCode = 'USD';
    if (!rateCheck.defaultRate)
      clientCurrencyCode = currencyCode[bookingPayment.country];
    let amount: number = rateCheck.rate;

    if (clientCurrencyCode !== currencyCode[rateCheck.currency]) {
      const counsellorCurrencyCode = currencyCode[rateCheck.currency];

      const googleSheetClient =
        await this.sheetApiService.getGoogleSheetClient();

      const nextRowNumber = await this.sheetApiService.getNextRowNumber(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
      );

      await this.sheetApiService.writeGoogleSheet(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
        `D${nextRowNumber}`,
        `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A${nextRowNumber}), B${nextRowNumber}))*C${nextRowNumber}`,
      );

      await this.sheetApiService.writeGoogleSheet(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
        `A${nextRowNumber}`,
        counsellorCurrencyCode,
      );

      await this.sheetApiService.writeGoogleSheet(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
        `B${nextRowNumber}`,
        clientCurrencyCode,
      );

      await this.sheetApiService.writeGoogleSheet(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
        `C${nextRowNumber}`,
        amount.toString(),
      );

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const exchangedAmount = await this.sheetApiService.readGoogleSheet(
        googleSheetClient,
        process.env.SPREADSHEET_ID,
        'Calculate_Rate',
        `D${nextRowNumber}`,
      );

      amount = Math.round(Number(exchangedAmount) * 100) / 100;
    }

    return await this.bookingPaymentModel.create({
      client: new Types.ObjectId(bookingPayment.client),
      counsellor: new Types.ObjectId(bookingPayment.counsellor),
      meeting: new Types.ObjectId(bookingPayment.meeting),
      meetingBooking: new Types.ObjectId(bookingPayment.meetingBooking),
      room: isNotEmpty(bookingPayment?.room[0]?._id)
        ? new Types.ObjectId(bookingPayment.room[0]._id)
        : undefined,
      currency: clientCurrencyCode,
      status: BookingPaymentStatus.PENDING,
      amount: amount,
    });
  }
}
