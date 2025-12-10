import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting, MeetingType } from './schemas/meeting.schema';
import { Model, Types } from 'mongoose';
import { COUNSELLOR_RATE_COLLECTION } from '../counsellor.rate/counsellor.rate.constants';
import { CounsellorRate } from '../counsellor.rate/schema/counsellor.rate.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { AddScheduleI } from './meeting.types';
import { LocationService } from '../location/location.service';
import { ScheduleService } from '../schedule/schedule.service';
import { ScheduleI } from '../schedule/schedule.types';
import { LOCATION_RESERVATION_COLLECTION } from '../location.reservation/location.reservation.constants';
import { LocationReservation } from '../location.reservation/schema/location.reservation.schema';
import { SCHEDULE_COLLECTION } from '../schedule/schedule.constants';
import { Schedule } from '../schedule/schema/schedule.schema';

const T = {
  scheduleNotFound: 'meeting schedule is not found',
  scheduleTimeInvaid: 'schedule start time is greater than end time',
  meetingNotFound: 'meeting is not found for given Id',
};

@Injectable()
export class MeetingScheduleService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly scheduleService: ScheduleService,
    @InjectModel(SCHEDULE_COLLECTION)
    private readonly scheduleModel: Model<Schedule>,
    private readonly locationService: LocationService,
    @InjectModel(COUNSELLOR_RATE_COLLECTION)
    private readonly rateModel: Model<CounsellorRate>,
    @InjectModel(LOCATION_RESERVATION_COLLECTION)
    private readonly reservationModel: Model<LocationReservation>,
  ) {}

  async findSelectedMeetingSchedule(meetingId: string, scheduleId: string) {
    const scheduleCheck = await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'scheduling.schedule': scheduleId,
        },
        {
          'scheduling.schedule.$': 1,
        },
      )
      .lean()
      .populate({
        path: 'scheduling.schedule',
      });

    if (!scheduleCheck && isEmpty(scheduleCheck?.scheduling?.schedule?.[0])) {
      throw new NotFoundException(T.scheduleNotFound);
    }
    console.log('scheduleCheck: ', scheduleCheck);

    return scheduleCheck.scheduling.schedule;
  }

  async addScheduleForMeeting(meetingId: string, schedule: AddScheduleI) {
    const meetingCheck = await this.meetingModel
      .findById(meetingId)
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new NotFoundException('meeting is not found');
        }

        if (isEmpty(d?.payment?.available[0])) {
          throw new BadRequestException(
            "you haven't selected a payment method for this meeting",
          );
        }

        if (
          d.meetingType === MeetingType.ONLINE &&
          isNotEmpty(schedule?.schedule?.room?.[0])
        ) {
          throw new BadRequestException(
            'you can not reserve a room for an online meeting',
          );
        } else if (
          d.meetingType !== MeetingType.ONLINE &&
          isEmpty(schedule?.schedule?.room?.[0])
        ) {
          throw new BadRequestException('select a location');
        }
        return d;
      });

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const scheduleStartTime = new Date(schedule.schedule.startTime);
    const scheduleEndTime = new Date(schedule.schedule.endTime);

    await this.rateModel
      .find({
        hourFrom: 0,
        hourTo:
          (scheduleEndTime.getTime() - scheduleStartTime.getTime()) / 3600000,
        counsellor: new Types.ObjectId(meetingCheck.organizer),
        defaultRate: true,
      })
      .then(async (d) => {
        if (isEmpty(d[0])) {
          throw new BadRequestException(
            "counsellor hasn't default rate this time range",
          );
        }
      });

    let locationCheck;
    if (meetingCheck.meetingType !== MeetingType.ONLINE) {
      locationCheck = await this.locationService.findSelectedLocation(
        schedule.schedule.room[0],
      );
    }

    // if (meetingCheck.meetingType === MeetingType.ON_PREMISE) {
    //   await this.reservationModel
    //     .findOne({
    //       counsellor: new Types.ObjectId(meetingCheck.organizer),
    //       location: new Types.ObjectId(schedule?.schedule?.room?.[0]),
    //       reserveFrom: { $lte: scheduleStartTime },
    //       reserveTo: {
    //         $gte: new Date(
    //           endDate.getFullYear(),
    //           endDate.getMonth(),
    //           endDate.getDate(),
    //           scheduleStartTime.getHours(),
    //           scheduleStartTime.getMinutes(),
    //           scheduleStartTime.getSeconds(),
    //           scheduleStartTime.getMilliseconds(),
    //         ),
    //       },
    //     })
    //     .then(async (d) => {
    //       if (isEmpty(d)) {
    //         throw new BadRequestException(
    //           'you have not reserve the meeting room this time slot',
    //         );
    //       }
    //     });
    // }

    const updatedMeetingScheduleId: Types.ObjectId[] = [];
    const updatedMeetingSchedule: ScheduleI[] = [];
    if (schedule.type === 'DAY') {
      if (meetingCheck.meetingType !== MeetingType.ONLINE) {
        await this.reservationModel
          .findOne({
            counsellor: new Types.ObjectId(meetingCheck.organizer),
            location: new Types.ObjectId(schedule?.schedule?.room?.[0]),
            reserveFrom: { $lte: scheduleStartTime },
            reserveTo: {
              $gte: new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate(),
                scheduleStartTime.getHours(),
                scheduleStartTime.getMinutes(),
                scheduleStartTime.getSeconds(),
                scheduleStartTime.getMilliseconds(),
              ),
            },
          })
          .then(async (d) => {
            if (isEmpty(d)) {
              throw new BadRequestException(
                'you have not reserve the meeting room this time slot',
              );
            }
          });
      }

      const scheduleId = new Types.ObjectId();

      await this.scheduleService
        .scheduleOverriding(
          meetingCheck.organizer,
          scheduleStartTime,
          scheduleEndTime,
        )
        .then(async (d) => {
          if (isNotEmpty(d[0])) {
            throw new BadRequestException(
              'you have already schedule a meeting for this time slot',
            );
          }
        });

      updatedMeetingSchedule.push({
        _id: scheduleId,
        counsellor: new Types.ObjectId(meetingCheck.organizer),
        meeting: new Types.ObjectId(meetingCheck._id),
        meetingType: meetingCheck.meetingType,
        meetingLink: schedule.meetingLink,
        scheduleType: schedule.type,
        ...schedule.schedule,
        room: [locationCheck?._id],
      });

      updatedMeetingScheduleId.push(scheduleId);
    } else if (
      schedule.type === 'DAY-MON' ||
      schedule.type === 'DAY-TUE' ||
      schedule.type === 'DAY-WED' ||
      schedule.type === 'DAY-THU' ||
      schedule.type === 'DAY-FRI' ||
      schedule.type === 'DAY-SAT' ||
      schedule.type === 'DAY-SUN'
    ) {
      if (
        startDate.toDateString().split(' ')[0].toUpperCase() !==
          schedule.type.split('-')[1] ||
        endDate.toDateString().split(' ')[0].toUpperCase() !==
          schedule.type.split('-')[1]
      ) {
        throw new BadRequestException(
          `schedule start and end date should be ${
            schedule.type.split('-')[1]
          }`,
        );
      }

      const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
      const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
      const weeksDifference = Math.round(timeDifference / millisecondsPerWeek);

      let startTime = scheduleStartTime.getTime();
      let endTime = scheduleEndTime.getTime();

      for (let i = -1; i < weeksDifference; i++) {
        if (meetingCheck.meetingType !== MeetingType.ONLINE) {
          await this.reservationModel
            .findOne({
              counsellor: new Types.ObjectId(meetingCheck.organizer),
              location: new Types.ObjectId(schedule?.schedule?.room?.[0]),
              reserveFrom: { $lte: new Date(startTime) },
              reserveTo: { $gte: new Date(endTime) },
            })
            .then(async (d) => {
              if (isEmpty(d)) {
                throw new BadRequestException(
                  'you have not reserve the meeting room this time slot',
                );
              }
            });
        }

        const scheduleId = new Types.ObjectId();

        const scheduleCheck = await this.scheduleService.scheduleOverriding(
          meetingCheck.organizer,
          new Date(startTime),
          new Date(endTime),
        );

        if (isEmpty(scheduleCheck[0])) {
          updatedMeetingSchedule.push({
            _id: scheduleId,
            counsellor: new Types.ObjectId(meetingCheck.organizer),
            meeting: new Types.ObjectId(meetingCheck._id),
            meetingType: meetingCheck.meetingType,
            meetingLink: schedule.meetingLink,
            scheduleType: schedule.type,
            ...schedule.schedule,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            room: [locationCheck?._id],
          });

          updatedMeetingScheduleId.push(scheduleId);
        }

        startTime = startTime + millisecondsPerWeek;
        endTime = endTime + millisecondsPerWeek;
      }
    } else if (schedule.type === 'RANGE') {
      if (
        startDate.toDateString().split(' ')[0].toUpperCase() !==
        schedule.schedule.rangeFrom
      ) {
        throw new BadRequestException(
          `schedule range start date should be ${schedule.schedule.rangeFrom}`,
        );
      } else if (
        endDate.toDateString().split(' ')[0].toUpperCase() !==
        schedule.schedule.rangeTo
      ) {
        throw new BadRequestException(
          `schedule range end date should be ${schedule.schedule.rangeTo}`,
        );
      }

      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
      const daysDifference = Math.round(timeDifference / millisecondsPerDay);

      let startTime = scheduleStartTime.getTime();
      let endTime = scheduleEndTime.getTime();

      let startDay = new Date(schedule.schedule.startTime).getDay();
      const validDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      for (let i = 0; i < daysDifference; i++) {
        const rangeFromIndex = validDays.indexOf(schedule.schedule.rangeFrom);
        const rangeToIndex = validDays.indexOf(schedule.schedule.rangeTo);
        if (
          (rangeFromIndex <= rangeToIndex &&
            startDay >= rangeFromIndex &&
            startDay <= rangeToIndex) || // Normal range
          (rangeFromIndex > rangeToIndex &&
            (startDay >= rangeFromIndex || startDay <= rangeToIndex)) // Wrapped range (e.g., FRI to MON)
        ) {
          if (meetingCheck.meetingType !== MeetingType.ONLINE) {
            await this.reservationModel
              .findOne({
                counsellor: new Types.ObjectId(meetingCheck.organizer),
                location: new Types.ObjectId(schedule?.schedule?.room?.[0]),
                reserveFrom: { $lte: new Date(startTime) },
                reserveTo: { $gte: new Date(endTime) },
              })
              .then(async (d) => {
                if (isEmpty(d)) {
                  throw new BadRequestException(
                    'you have not reserve the meeting room this time slot',
                  );
                }
              });
          }

          const scheduleId = new Types.ObjectId();

          const scheduleCheck = await this.scheduleService.scheduleOverriding(
            meetingCheck.organizer,
            new Date(startTime),
            new Date(endTime),
          );

          if (isEmpty(scheduleCheck[0])) {
            updatedMeetingSchedule.push({
              _id: scheduleId,
              counsellor: new Types.ObjectId(meetingCheck.organizer),
              meeting: new Types.ObjectId(meetingCheck._id),
              meetingType: meetingCheck.meetingType,
              scheduleType: schedule.type,
              meetingLink: schedule.meetingLink,
              ...schedule.schedule,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              room: [locationCheck?._id],
            });

            updatedMeetingScheduleId.push(scheduleId);
          }
        }
        startTime = startTime + millisecondsPerDay;
        endTime = endTime + millisecondsPerDay;

        startDay = (startDay + 1) % 7;
      }
    } else if (schedule.type === 'EVERYDAY') {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
      const daysDifference = Math.round(timeDifference / millisecondsPerDay);

      let startTime = scheduleStartTime.getTime();
      let endTime = scheduleEndTime.getTime();

      for (let i = 0; i < daysDifference; i++) {
        if (meetingCheck.meetingType !== MeetingType.ONLINE) {
          await this.reservationModel
            .findOne({
              counsellor: new Types.ObjectId(meetingCheck.organizer),
              location: new Types.ObjectId(schedule?.schedule?.room?.[0]),
              reserveFrom: { $lte: new Date(startTime) },
              reserveTo: { $gte: new Date(endTime) },
            })
            .then(async (d) => {
              if (isEmpty(d)) {
                throw new BadRequestException(
                  'you have not reserve the meeting room this time slot',
                );
              }
            });
        }

        const scheduleId = new Types.ObjectId();

        const scheduleCheck = await this.scheduleService.scheduleOverriding(
          meetingCheck.organizer,
          new Date(startTime),
          new Date(endTime),
        );

        if (isEmpty(scheduleCheck[0])) {
          updatedMeetingSchedule.push({
            _id: scheduleId,
            counsellor: new Types.ObjectId(meetingCheck.organizer),
            meeting: new Types.ObjectId(meetingCheck._id),
            meetingType: meetingCheck.meetingType,
            scheduleType: schedule.type,
            meetingLink: schedule.meetingLink,
            ...schedule.schedule,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            room: [locationCheck?._id],
          });

          updatedMeetingScheduleId.push(scheduleId);
        }

        startTime = startTime + millisecondsPerDay;
        endTime = endTime + millisecondsPerDay;
      }
    }

    await this.scheduleService.addSchedules(updatedMeetingSchedule);
    return await this.meetingModel.findByIdAndUpdate(
      meetingId,
      {
        $push: { 'scheduling.schedule': updatedMeetingScheduleId },
      },
      { new: true, lean: true },
    );
  }

  async remove(meetingId: string, scheduleId: string): Promise<Meeting> {
    await this.meetingModel
      .findOne(
        {
          _id: meetingId,
          'scheduling.schedule': scheduleId,
        },
        {
          'scheduling.schedule.$': 1,
        },
      )
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.warn(
            'Meeting is not found for given meeting Id or schedule',
            'Schedule',
          );
          return;
        }

        await this.meetingModel.findOneAndUpdate(
          { _id: meetingId, 'scheduling.schedule': scheduleId },
          { $pull: { 'scheduling.schedule': scheduleId } },
          { new: true, lean: true },
        );
      });

    await this.scheduleService
      .findSelectedSchedule(scheduleId)
      .then(async () => {
        await this.scheduleService.deleteSchedule(scheduleId);
      })
      .catch(async () => {
        Logger.warn(
          'Meeting schedule is not found in schedule record',
          'Schedule',
        );
      });

    const meetingCheck = await this.meetingModel.findById(meetingId).lean();
    if (isEmpty(meetingCheck))
      throw new BadRequestException(
        'Meeting is not found for given meeting Id',
      );
    return meetingCheck;
  }

  async deleteAllSchedules(
    meeting: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const meetingCheck = await this.meetingModel.findById(meeting).lean();
    if (isEmpty(meetingCheck)) throw new BadRequestException(T.meetingNotFound);

    await this.scheduleModel.deleteMany({
      meeting: new Types.ObjectId(meeting),
      ...(isNotEmpty(startTime)
        ? { startTime: { $gte: new Date(startTime) } }
        : {}),
      ...(isNotEmpty(endTime) ? { endTime: { $lte: new Date(endTime) } } : {}),
    });

    await this.meetingModel.findByIdAndUpdate(
      new Types.ObjectId(meeting),
      { $unset: { 'scheduling.schedule': '' } },
      { new: true, lean: true },
    );
  }
}
