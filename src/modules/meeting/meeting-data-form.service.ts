import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataFormService } from '../data-form/data-form.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingService } from './meeting.service';
import { Meeting } from './schemas/meeting.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { AddDataFormI } from './meeting.types';

const T = {
  daraFormNotFound: 'meeeting linked data form is not found',
  alreadyAdded: 'this data form has already been added to the meeting',
};

@Injectable()
export class MeetingDataFormService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly meetingService: MeetingService,
    private readonly dataFormService: DataFormService,
  ) {}

  async findSelectedMeetingDataForm(meetingId: string, dataFormId: string) {
    const dataFormCheck = await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'forms.linkedForms': { $elemMatch: { _id: dataFormId } },
        },
        {
          'forms.linkedForms.$': 1,
        },
      )
      .populate('forms.linkedForms.form')
      .lean();

    if (isEmpty(dataFormCheck)) {
      throw new NotFoundException(T.daraFormNotFound);
    }
    return dataFormCheck;
  }

  async addLinkedForm(
    meetingId: string,
    dataFormId: string,
    linkedForms: AddDataFormI,
  ) {
    const meeetingCheck = await this.meetingService.findSelectedMeeting(
      meetingId,
    );

    await this.dataFormService
      .findSelectedDataForm(dataFormId)
      .then(async (d) => {
        if (isEmpty(d.data[0])) {
          throw new BadRequestException('your data form is empty');
        }
      });

    await this.meetingModel
      .findOne({
        _id: meetingId,
        'forms.linkedForms': { $elemMatch: { form: dataFormId } },
      })
      .then(async (d) => {
        if (isNotEmpty(d)) {
          throw new BadRequestException(T.alreadyAdded);
        }
      });

    if (isEmpty(linkedForms.order)) {
      if (isEmpty(meeetingCheck?.forms?.linkedForms[0])) {
        linkedForms.order = 1;
      } else {
        linkedForms.order =
          meeetingCheck?.forms?.linkedForms[
            meeetingCheck?.forms?.linkedForms.length - 1
          ].order + 1;
      }
    } else if (
      isEmpty(meeetingCheck?.forms?.linkedForms[0]) &&
      linkedForms.order !== 1
    ) {
      throw new BadRequestException('data form order should be 1');
    } else if (
      isNotEmpty(meeetingCheck?.forms?.linkedForms[0]) &&
      linkedForms.order !==
        meeetingCheck?.forms?.linkedForms[
          meeetingCheck?.forms?.linkedForms.length - 1
        ].order +
          1
    ) {
      throw new BadRequestException(
        'order number provided is not the next sequential order number',
      );
    }

    const updatedMeeting = await this.meetingModel.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          'forms.linkedForms': [
            {
              form: dataFormId,
              order: linkedForms.order,
              allowSkip: linkedForms.allowSkip,
            },
          ],
        },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }

  async removeDataForm(meetingId: string, dataFormId: string) {
    await this.meetingService.findSelectedMeeting(meetingId);

    await this.findSelectedMeetingDataForm(meetingId, dataFormId);

    const updatedMeeting = await this.meetingModel.findOneAndUpdate(
      {
        _id: meetingId,
        'forms.linkedForms._id': dataFormId,
      },
      {
        $pull: {
          'forms.linkedForms': { _id: dataFormId },
        },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }
}
