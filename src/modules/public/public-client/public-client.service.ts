import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty, isNotEmpty } from 'class-validator';
import { Model, Types } from 'mongoose';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import { Client } from 'src/modules/client/schemas/client.schema';
import {
  CreateClientI,
  CreateIntakeFormI,
  ExsistedClientI,
} from './public-client.type';
import { COUNSELLOR_RATE_COLLECTION } from 'src/modules/counsellor.rate/counsellor.rate.constants';
import { CounsellorRate } from 'src/modules/counsellor.rate/schema/counsellor.rate.schema';
import { MeetingBooking } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPayment } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { DataForm } from 'src/modules/data-form/schemas/data-form.schema';
import * as CC from 'currency-converter-lt';

@Injectable()
export class PublicClientService {
  private currencyConverter;

  constructor(
    @InjectModel(CLIENT_COLLECTION) private readonly clientModel: Model<Client>,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    @InjectModel(COUNSELLOR_RATE_COLLECTION)
    private readonly rateModel: Model<CounsellorRate>,
    @InjectModel(DataForm.name) private readonly dataFormModel: Model<DataForm>,
  ) {
    this.currencyConverter = new CC();
  }

  async findById(clientId: string) {
    return await this.clientModel.findById(clientId).then(async (d) => {
      if (isEmpty(d)) throw new BadRequestException('');

      return d;
    });
  }

  /**
   * Finds a client vy their phone number and returns their details if found
   *
   * @param phone
   * @returns promise that resolves to an ibject containing client details
   */
  async findByPhone(target: ExsistedClientI) {
    const clientCheck = await this.clientModel.findOne({
      ...(isNotEmpty(target.phone)
        ? { phone: target.phone }
        : { email: target.email }),
    });

    /**
     * Initialize an object with default values
     */
    const clientDetails = {
      country: '',
      nationality: '',
    };

    /**
     * If clientCheck is not undefined, update the client details object with found values
     */
    if (isNotEmpty(clientCheck)) {
      clientDetails.country = clientCheck.country;
      clientDetails.nationality = clientCheck.nationality;
    }

    return { ...clientDetails, clientExsisted: isNotEmpty(clientCheck) };
  }

  /**
   * Creates or update a client, associates the client with a meeting booking
   * checks the counsellor rate for the meetin gtime range, and creates a booking payment
   * @param meetingBookingId
   * @param counsellorId
   * @param client
   * @returns Object containing the created/updated client, updated meeting booking, and created booking payment
   */
  async createClient(
    meetingBookingId: string,
    counsellorId: string,
    client: CreateClientI,
  ) {
    /**
     * Find and create the client based on the email, and update the client data
     */
    const createdClient = await this.clientModel.findOneAndUpdate(
      { email: client.email },
      { $set: { ...client, phoneVerified: false, emailVerified: true } },
      { new: true, lean: true, upsert: true },
    );

    /**
     * Find and update the meeting booking with the created client Id
     */
    let updatedMeetingBooking = await this.meetingBookingModel
      .findById(meetingBookingId)
      .lean()
      .populate('room')
      .then(async (d) => {
        if (isEmpty(d))
          throw new NotFoundException('meeting booking is not found');

        return await this.meetingBookingModel.findByIdAndUpdate(
          meetingBookingId,
          { client: new Types.ObjectId(createdClient._id) },
          { new: true, lean: true },
        );
      });

    /**
     * Calculate the time range in hours for the meeting booking
     */
    const timeRangeHours =
      (updatedMeetingBooking.timeTo.getTime() -
        updatedMeetingBooking.timeFrom.getTime()) /
      3600000;

    /**
     * Check if the counsellor has a rate defined for the given time range, country, and nationality
     */
    const rateCheck = await this.rateModel
      .findOne({
        counsellor: new Types.ObjectId(counsellorId),
        hourFrom: 0,
        hourTo: timeRangeHours,
        country: client.country,
        nationality: client.nationality,
      })
      .lean()
      .then(async (d) => {
        if (isEmpty(d))
          return await this.rateModel
            .findOne({
              counsellor: new Types.ObjectId(counsellorId),
              hourFrom: 0,
              hourTo: timeRangeHours,
              defaultRate: true,
            })
            .then(async (d) => {
              const defaultNationalityRate = await this.rateModel.findOne({
                counsellor: new Types.ObjectId(counsellorId),
                hourFrom: 0,
                hourTo: timeRangeHours,
                country: d.country,
                nationality: client.nationality,
              });

              if (isNotEmpty(defaultNationalityRate))
                return defaultNationalityRate;

              return d;
            });

        return d;
      });

    if (isEmpty(rateCheck)) {
      throw new BadRequestException('rate is not define for this meeting');
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const currencyCode = require('country-to-currency');

    let clientCurrencyCode = 'USD';

    /**
     * Determine the client currency code based on the country, if not using the default rate
     */
    if (!rateCheck.defaultRate)
      clientCurrencyCode = currencyCode[client.country];

    let amount: number = rateCheck.rate;

    /**
     * Convert the rate amount to the client currency if needed
     */
    if (clientCurrencyCode !== currencyCode[rateCheck.currency]) {
      const counsellorCurrencyCode = currencyCode[rateCheck.currency];

      amount = await this.currencyConverter
        .from(counsellorCurrencyCode)
        .to(clientCurrencyCode)
        .amount(rateCheck.rate)
        .convert();
    }

    /**
     * Create a booking payment with the calculated amount and currency
     */
    const createdBookingPayment = await this.bookingPaymentModel.create({
      client: new Types.ObjectId(createdClient._id),
      counsellor: new Types.ObjectId(counsellorId),
      meeting: new Types.ObjectId(meetingBookingId),
      room: updatedMeetingBooking.room?._id
        ? new Types.ObjectId(updatedMeetingBooking.room._id)
        : undefined,
      currency: clientCurrencyCode,
      amount: amount,
    });

    /**
     * Update the meeting booking with the created booking payment Id
     */
    updatedMeetingBooking = await this.meetingBookingModel.findByIdAndUpdate(
      meetingBookingId,
      {
        _bookingPaymentId: new Types.ObjectId(createdBookingPayment._id),
      },
      { new: true, lean: true },
    );

    return {
      clinet: createdClient,
      booking: updatedMeetingBooking,
      payment: createdBookingPayment,
    };
  }

  /**
   * Adds an intake form to a client record
   *
   * @param clientId
   * @param intakeForm
   * @returns the updated client data if sucessful
   */
  async addIntakeFormToClient(clientId: string, intakeForm: CreateIntakeFormI) {
    /**
     * Verify the client exists
     */
    await this.findById(clientId);

    /**
     * Verify the data form exists
     */
    await this.dataFormModel.findById(intakeForm.form).then(async (d) => {
      if (isEmpty(d)) throw new BadRequestException('data form is not found');

      return d;
    });

    /**
     * update the client intake forms
     */
    const updatedClient = await this.clientModel.findByIdAndUpdate(
      clientId,
      {
        $push: {
          intakeForm: [
            {
              date: new Date(),
              form: new Types.ObjectId(intakeForm.form),
              formData: intakeForm.formData,
            },
          ],
        },
      },
      { new: true, lean: true },
    );

    return updatedClient;
  }
}
