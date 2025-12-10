import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting } from './schemas/meeting.schema';
import { Model } from 'mongoose';
import { MeetingService } from './meeting.service';
import { AddMeetingNotificationi } from './meeting.types';
import { isEmpty } from 'class-validator';

const T = {
  notificationNotFound: 'notification is not found',
  templateTypeSame: 'notification and template type should be same',
};

@Injectable()
export class MeetingNotificationService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly meetingService: MeetingService,
  ) {}

  async findSelectedMeetingNotification(
    meetingId: string,
    notificationId: string,
  ) {
    const notificationCheck = await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'scheduling.notifications': { $elemMatch: { _id: notificationId } },
        },
        {
          'scheduling.notifications.$': 1,
        },
      )
      .lean();

    if (
      !!notificationCheck &&
      isEmpty(notificationCheck.scheduling.notifications[0])
    ) {
      Logger.warn(T.notificationNotFound.toUpperCase());
      throw new NotFoundException(T.notificationNotFound);
    }
    return notificationCheck.scheduling.notifications;
  }

  async addNotificationForMeeting(
    meetingId: string,
    notification: AddMeetingNotificationi,
  ): Promise<Meeting> {
    await this.meetingService.findSelectedMeeting(meetingId);

    // await this.notificationService
    //   .findSelectedTemplate(notification.template)
    //   .then(async (d) => {
    //     if (d.type !== notification.type) {
    //       Logger.warn(T.templateTypeSame.toUpperCase());
    //       throw new BadRequestException(T.templateTypeSame);
    //     }
    //   });

    const updatedMeeting = await this.meetingModel.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          'scheduling.notifications': [notification],
        },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }

  // async update(
  //   meetingId: string,
  //   notificationId: string,
  //   updateMeetingNotificationDto: UpdateMeetingNotificationDto,
  // ): Promise<Meeting> {
  //   // checking the provided ID is a valid ObjectId
  //   const isMeetingValidId = mongoose.isValidObjectId(meetingId);
  //   if (!isMeetingValidId)
  //     throw new BadRequestException(`Meeting #${meetingId} is not valid.`);

  //   const meeting = await this.meetingModel.findById(meetingId);
  //   if (!meeting)
  //     throw new NotFoundException(`Meeting #${meetingId} is not found`);

  //   if (updateMeetingNotificationDto.template) {
  //     // checking the provided ID is a valid ObjectId
  //     const isNotificationTemplateValidId =
  //       mongoose.isValidObjectId(notificationId);
  //     if (!isNotificationTemplateValidId)
  //       throw new BadRequestException(
  //         `Notification Template #${notificationId} is not valid`,
  //       );
  //     const templage = await this.templateModel.findById(
  //       updateMeetingNotificationDto.template,
  //     );
  //     if (!templage)
  //       throw new NotFoundException(
  //         `Notification template #${updateMeetingNotificationDto.template} is not found`,
  //       );
  //   }

  //   const updatedMeeting = await this.meetingModel
  //     .findByIdAndUpdate(
  //       {
  //         _id: meetingId,
  //         'scheduling.notifications._id': notificationId,
  //       },
  //       {
  //         $set: {
  //           'scheduling.notifications.$.type':
  //             updateMeetingNotificationDto.type,
  //           'scheduling.notifications.$.enable':
  //             updateMeetingNotificationDto.enable,
  //           'scheduling.notifications.$.template':
  //             updateMeetingNotificationDto.template,
  //           'scheduling.notifications.$.remark':
  //             updateMeetingNotificationDto.remark,
  //           'scheduling.notifications.$.sendBefore':
  //             updateMeetingNotificationDto.sendBefore,
  //         },
  //       },
  //       { new: true },
  //     )
  //     .exec();
  //   if (!updatedMeeting)
  //     throw new NotFoundException(
  //       `Notification #${notificationId} is not found`,
  //     );
  //   return updatedMeeting;
  // }

  async removeNotificationFromMeeting(
    meetingId: string,
    notificationId: string,
  ): Promise<Meeting> {
    await this.meetingService.findSelectedMeeting(meetingId);

    await this.findSelectedMeetingNotification(meetingId, notificationId);

    const removedNotification = await this.meetingModel.findOneAndUpdate(
      {
        _id: meetingId,
        'scheduling.notifications._id': notificationId,
      },
      { $pull: { 'scheduling.notifications': { _id: notificationId } } },
      { new: true, lean: true },
    );
    return removedNotification;
  }
}
