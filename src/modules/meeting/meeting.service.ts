import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting } from './schemas/meeting.schema';
import { Model, Types } from 'mongoose';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { User } from 'src/config/authorization/user.decorator';
import { CreateMeetingI, UpdateMeetingI } from './meeting.types';
import { ScheduleService } from '../schedule/schedule.service';

const T = {
  meetingNotFound: 'meeting is not found',
  counsellorNotFound: 'counsellor is not found',
};

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    @InjectModel(Counsellor.name)
    private readonly counsellorModel: Model<Counsellor>,
    private readonly scheduleService: ScheduleService,
  ) {}

  async findAll(user: User, limit: number, page: number) {
    const filter: any = {};

    if (!user.isSuperAdmin && user.isCounsellor && isNotEmpty(user.counsellor))
      filter.counsellor = new Types.ObjectId(user.counsellor);

    const totalDocs = await this.meetingModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const meetingsCheck = await this.meetingModel
      .find(filter)
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .populate([
        {
          path: 'organizer',
          select: '_id profilePictureURL title displayName',
        },
      ]);

    return {
      docs: meetingsCheck,
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

  async findSelectedMeeting(meetingId: string): Promise<Meeting> {
    const meetingCheck = await this.meetingModel
      .findById(meetingId)
      .lean()
      .populate([
        {
          path: 'organizer',
          select: 'profilePictureURL title displayName',
        },
        {
          path: 'scheduling.notifications.template',
          select: 'name template',
        },
        {
          path: 'scheduling.schedule',
        },
        {
          path: 'scheduling.schedule.counsellor',
        },
        {
          path: 'scheduling.schedule.location',
        },
        {
          path: 'forms.linkedForms.form',
          select: 'type title description',
        },
      ]);

    if (isEmpty(meetingCheck)) {
      Logger.debug(T.meetingNotFound.toUpperCase());
      throw new NotFoundException(T.meetingNotFound);
    }

    meetingCheck?.forms?.linkedForms?.sort((a, b) => a.order - b.order);

    return meetingCheck;
  }

  async createMeeting(user: User, meeting: CreateMeetingI): Promise<Meeting> {
    const counsellorCheck = await this.counsellorModel
      .findOne(
        user.isSuperAdmin || user.isAdmin
          ? { _id: new Types.ObjectId(meeting.organizer) }
          : { userId: user.user },
      )
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.debug(T.counsellorNotFound.toUpperCase());
          throw new NotFoundException(T.counsellorNotFound);
        }
        return d;
      });

    const createdMeeting = await this.meetingModel.create({
      ...meeting,
      organizer: new Types.ObjectId(counsellorCheck._id),
      ownedBy: counsellorCheck.userId,
    });
    return createdMeeting;
  }

  async updateMeeting(
    meetingId: string,
    meeting: UpdateMeetingI,
  ): Promise<Meeting> {
    await this.findSelectedMeeting(meetingId);

    const updatedMeeting = await this.meetingModel.findByIdAndUpdate(
      meetingId,
      { $set: meeting },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }

  async deleteMeeting(meetingId: string): Promise<Meeting> {
    await this.findSelectedMeeting(meetingId).then(async (d) => {
      if (isNotEmpty(d.scheduling.schedule[0])) {
        for (let i = 0; i < d.scheduling.schedule.length; i++) {
          this.scheduleService.deleteSchedule(d.scheduling.schedule[i]);
        }
      }
    });

    const deletedMeeting = await this.meetingModel.findByIdAndRemove(meetingId);
    return deletedMeeting;
  }
}
