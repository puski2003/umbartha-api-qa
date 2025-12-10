import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentOption } from './schemas/payment.option.schema';
import { Model } from 'mongoose';
import { isEmpty, isNotEmpty } from 'class-validator';
import { PAYMENT_OPTION_COLLECTION } from './payment.option.constants';
import {
  CreatePaymentOptionI,
  UpdatePaymentOptionI,
} from './payment.option.types';
import { PaginatedObjI } from 'src/config/common/types/paginated-object.type';
import { User } from 'src/config/authorization/user.decorator';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { MeetingType } from '../meeting/schemas/meeting.schema';

const T = {
  optionaNotFound: 'payment option is not found',
};

@Injectable()
export class PaymentOptionService {
  constructor(
    @InjectModel(PAYMENT_OPTION_COLLECTION)
    private readonly paymentOptionModel: Model<PaymentOption>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
  ) {}

  /**
   * Retrieves a paginated list og payment option
   *
   * @param limit
   * @param page
   * @returns object containing the payment options and pagination information
   */
  async findAll(
    limit = 50,
    page = 1,
    user: User,
    meetingType: string,
    counsellor: string,
  ): Promise<PaginatedObjI> {
    const filter: any = {};

    if (
      !user.isSuperAdmin &&
      !user.isAdmin &&
      user.isCounsellor &&
      isNotEmpty(user.counsellor)
    )
      filter.counsellor = user.counsellor;

    if (isNotEmpty(counsellor)) filter.counsellor = counsellor;

    if (isNotEmpty(meetingType) && meetingType != MeetingType.BOTH)
      filter.meetingType = { $in: [meetingType, MeetingType.BOTH] };

    const totalDocs = await this.paymentOptionModel.countDocuments({
      $or: [filter],
    });
    const totalPages = Math.ceil(totalDocs / limit);

    const optionsCheck = await this.paymentOptionModel
      .find({ $or: [filter] })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: optionsCheck,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: limit,
        nextPage: page + 1,
        page: page,
        prevPage: page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  /**
   * Retrieves a payment option by its ID
   *
   * @param optionId
   * @returns the payment option if found
   * @throws NotFoundException if the payment option in not found
   */
  async findById(optionId: string): Promise<PaymentOption> {
    const paymentOptionCheck = await this.paymentOptionModel
      .findById(optionId)
      .populate('counsellor template service')
      .lean();

    if (isEmpty(paymentOptionCheck))
      throw new NotFoundException(T.optionaNotFound);

    return paymentOptionCheck;
  }

  /**
   * Create a new payment option
   *
   * @param payment
   * @returns created payment option
   */
  async createOption(payment: CreatePaymentOptionI): Promise<PaymentOption> {
    return await this.paymentOptionModel.create(payment);
  }

  /**
   * Update an existing payment option
   *
   * @param paymentOptionId
   * @param payment
   * @returns updated payment option
   */
  async updateOption(
    paymentOptionId: string,
    payment: UpdatePaymentOptionI,
  ): Promise<PaymentOption> {
    await this.findById(paymentOptionId);

    return await this.paymentOptionModel.findByIdAndUpdate(
      paymentOptionId,
      { $set: payment },
      { new: true, lean: true },
    );
  }

  /**
   * Deletes a payment option
   *
   * @param optionId
   * @returns deleted payment option
   */
  async deleteOption(optionId: string): Promise<PaymentOption> {
    await this.findById(optionId);

    return await this.paymentOptionModel.findByIdAndRemove(optionId);
  }

  /**
   * Retrieves an enabled payment opyion by its Id
   *
   * @param optionId
   * @returns enabled payment option if found
   * @throws NotFoundException if the payment option is not found or not enabled
   */
  async findEnabledOption(optionId: string): Promise<PaymentOption> {
    const paymentCheck = await this.paymentOptionModel
      .findOne({
        _id: optionId,
        enabled: true,
      })
      .lean();

    if (isEmpty(paymentCheck)) throw new NotFoundException(T.optionaNotFound);

    return paymentCheck;
  }

  /**
   * Teggles the enabled status of a payment option
   *
   * @param oprionaId
   * @returns
   */
  async changeEnabled(oprionaId: string) {
    const payment = await this.findById(oprionaId);

    const updatedOption = await this.paymentOptionModel.findByIdAndUpdate(
      oprionaId,
      {
        $set: payment.enabled
          ? {
              enabled: false,
            }
          : {
              enabled: true,
            },
      },
      { new: true, lean: true },
    );

    return updatedOption;
  }
}
