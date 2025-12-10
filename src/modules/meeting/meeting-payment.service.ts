import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting } from './schemas/meeting.schema';
import { Model } from 'mongoose';
import { MeetingService } from './meeting.service';
import { isEmpty, isNotEmpty } from 'class-validator';
import { OverrideI } from './meeting.types';
import { PaymentOptionService } from '../payment.option/payment.option.service';

const T = {
  availableOptionNotFound: 'meeting available payment option is not found',
  optionNotFound: 'payment option is not found',
  alreadyAdded: 'this payment option has already been added to the meeting',
};

@Injectable()
export class MeetingPaymentService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly meetingService: MeetingService,
    private readonly paymentService: PaymentOptionService,
  ) {}

  async findAvailableOption(meetingId: string, optionId: string) {
    const availableOption = await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'payment.available': optionId,
        },
        {
          'payment.available.$': 1,
        },
      )
      .populate('payment.available')
      .lean();

    if (isEmpty(availableOption)) {
      throw new NotFoundException(T.availableOptionNotFound);
    }
    return availableOption;
  }

  async addAvailableOption(
    meetingId: string,
    optionId: string,
    override: OverrideI,
  ): Promise<Meeting> {
    await this.meetingService.findSelectedMeeting(meetingId);

    await this.meetingModel
      .findOne({
        _id: meetingId,
        'payment.available': optionId,
      })
      .then(async (d) => {
        if (isNotEmpty(d)) {
          throw new BadRequestException(T.alreadyAdded);
        }
      });

    const paymentCheck = await this.paymentService.findEnabledOption(optionId);

    const updatedMeeting = await this.meetingModel.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          'payment.available': [optionId],
          'payment.overrides': [
            {
              _id: optionId,
              name: paymentCheck.name,
              enable: true,
              description: paymentCheck.description,
              additionalInfo: override.additionalInfo,
              template: paymentCheck.template,
              bankDetails: paymentCheck?.bankDetails,
              paypal: paymentCheck?.payPal,
              meetingType: paymentCheck?.meetingType,
            },
          ],
        },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }

  async removeOption(meetingId: string, optionId: string) {
    await this.meetingService.findSelectedMeeting(meetingId);

    await this.findAvailableOption(meetingId, optionId);

    const updatedMeeting = await this.meetingModel.findOneAndUpdate(
      { _id: meetingId, 'payment.available': optionId },
      {
        $pull: {
          'payment.available': optionId,
          'payment.overrides': { _id: optionId },
        },
      },
      { new: true, lean: true },
    );

    return updatedMeeting;
  }
}
