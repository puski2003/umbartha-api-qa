import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { MeetingScheduleService } from './meeting-schedule.service';
import { CreateScheduleRequestDto } from './dto/create.meeting.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import { MeetingParams, MeetingScheduleParams } from './dto/query.meeting.dto';
import { DeleteAllSchedules } from './dto/update.meeting.dto';

@Controller('meeting')
export class MeetingScheduleController {
  constructor(
    private readonly meetingScheduleService: MeetingScheduleService,
  ) {}

  @Auth('jar')
  @Get(':meetingId/schedule/:scheduleId')
  async findSchedule(@Param() params: MeetingScheduleParams) {
    return await this.meetingScheduleService.findSelectedMeetingSchedule(
      params.meetingId,
      params.scheduleId,
    );
  }

  @Auth('jar')
  @Put(':meetingId/schedule')
  async addSchedule(
    @Param() params: MeetingParams,
    @Body() schedule: CreateScheduleRequestDto,
  ) {
    return await this.meetingScheduleService.addScheduleForMeeting(
      params.meetingId,
      schedule,
    );
  }

  @Delete(':meetingId/schedule')
  async deleteAllSchedules(
    @Param() params: MeetingParams,
    @Query() { startTime, endTime }: DeleteAllSchedules,
  ) {
    return await this.meetingScheduleService.deleteAllSchedules(
      params.meetingId,
      startTime,
      endTime,
    );
  }

  @Auth('jar')
  @Delete(':meetingId/schedule/:scheduleId')
  removeSchedule(@Param() params: MeetingScheduleParams) {
    return this.meetingScheduleService.remove(
      params.meetingId,
      params.scheduleId,
    );
  }
}
