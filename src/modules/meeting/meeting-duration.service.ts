import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting } from './schemas/meeting.schema';
import { Model } from 'mongoose';
import { isEmpty } from 'class-validator';
import { MeetingService } from './meeting.service';
import { AdddurationOptionI } from './meeting.types';

const T = {
  durationNotFound: 'meeting duration is not found',
  counsellorRateNotFound: 'counsellor rate is not found',
};

@Injectable()
export class MeetingDurationService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly meetingService: MeetingService,
  ) {}

  async findSelectedMeetingDuration(meetingId: string, durationId: string) {
    const durationCheck = await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'scheduling.durationOptions': { $elemMatch: { _id: durationId } },
        },
        {
          'scheduling.durationOptions.$': 1,
        },
      )
      .lean();

    if (
      !!durationCheck &&
      isEmpty(durationCheck.scheduling.durationOptions[0])
    ) {
      Logger.warn(T.durationNotFound.toUpperCase());
      throw new NotFoundException(T.durationNotFound);
    }
    return durationCheck.scheduling.durationOptions;
  }

  async addDurationForMeeting(
    meetingId: string,
    duration: AdddurationOptionI,
  ): Promise<Meeting> {
    await this.meetingService.findSelectedMeeting(meetingId);

    const updatedMeeting = await this.meetingModel.findByIdAndUpdate(
      meetingId,
      {
        $push: {
          'scheduling.durationOptions': {
            ...duration,
            display: `${duration.hours} Hr ${duration.mins} Mins`,
          },
        },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }

  /**
   * update a Duration Option of a Meeting
   * @param {string} meetngId - ID of the meeting
   * @param {string} durationId - ID of the Duration Option to update
   * @param {UpdatedurationOptionDto} updatedurationOptionDto - data for updating the Duration Option
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId
   * @throws {NotFoundException} throws if no Meeting or Duration Option with the provided ID
   * @returns {Promise<Meeting>} promise that resolves to the updated Meeting
   */
  // async update(
  //   meetingId: string,
  //   durationOptionId: string,
  //   updatedurationOptionDto: UpdateDurationOptionDto,
  // ): Promise<Meeting> {
  //   // checking the provided ID is a valid ObjectId
  //   const isValidMeetingeId = mongoose.isValidObjectId(meetingId);
  //   if (!isValidMeetingeId)
  //     throw new BadRequestException(`Meeting #${meetingId} is not valid.`);
  //   const meeting = await this.meetingModel.findById(meetingId);
  //   if (!meeting)
  //     throw new NotFoundException(`Meeting #${meetingId} is not found`);

  //   // checking the provided ID is a valid ObjectId
  //   const isValidDurationOptionId = mongoose.isValidObjectId(durationOptionId);
  //   if (!isValidDurationOptionId)
  //     throw new BadRequestException(
  //       `Duration Option #${durationOptionId} is not valid.`,
  //     );

  //   const updatedMeeting = await this.meetingModel
  //     .findByIdAndUpdate(
  //       { _id: meetingId, 'scheduling.durationOptions._id': durationOptionId },
  //       {
  //         $set: {
  //           'scheduling.durationOptions': {
  //             _id: durationOptionId,
  //             hours: updatedurationOptionDto.hours,
  //             mins: updatedurationOptionDto.mins,
  //             display: `${updatedurationOptionDto.hours} Hr ${updatedurationOptionDto.mins}Mins`,
  //           },
  //         },
  //       },
  //       { new: true },
  //     )
  //     .exec();
  //   if (!updatedMeeting)
  //     throw new NotFoundException(
  //       `Duration option #${durationOptionId} is not found`,
  //     );
  //   return updatedMeeting;
  // }

  async remove(meetingId: string, durationId: string): Promise<Meeting> {
    await this.meetingService.findSelectedMeeting(meetingId);

    await this.findSelectedMeetingDuration(meetingId, durationId);

    const updatedMeeting = await this.meetingModel.findOneAndUpdate(
      {
        _id: meetingId,
        'scheduling.durationOptions._id': durationId,
      },
      {
        $pull: { 'scheduling.durationOptions': { _id: durationId } },
      },
      { new: true, lean: true },
    );
    return updatedMeeting;
  }
}
