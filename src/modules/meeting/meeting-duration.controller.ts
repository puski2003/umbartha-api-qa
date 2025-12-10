import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { MeetingDurationService } from './meeting-duration.service';
import { CreatedurationOptionDto } from './dto/create.meeting.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import { MeetingDurationParams, MeetingParams } from './dto/query.meeting.dto';

@Controller('meeting')
export class MeetingDurationController {
  constructor(
    private readonly meetingDurationService: MeetingDurationService,
  ) {}

  @Auth('jar')
  @Get(':meetingId/duration/:durationId')
  async findDuration(@Param() params: MeetingDurationParams) {
    return await this.meetingDurationService.findSelectedMeetingDuration(
      params.meetingId,
      params.durationId,
    );
  }

  @Auth('jar')
  @Put(':meetingId/duration')
  async addDurationOption(
    @Param() params: MeetingParams,
    @Body() duration: CreatedurationOptionDto,
  ) {
    return await this.meetingDurationService.addDurationForMeeting(
      params.meetingId,
      duration,
    );
  }

  // @Patch(':durationOptionId')
  // updateDurationOption(
  //   @Param('meetingId') meetingId: string,
  //   @Param('durationOptionId') durationOptionId: string,
  //   @Body() updatedurationOptionDto: UpdateDurationOptionDto,
  // ) {
  //   return this.meetingDurationService.update(
  //     meetingId,
  //     durationOptionId,
  //     updatedurationOptionDto,
  //   );
  // }

  @Auth('jar')
  @Delete(':meetingId/duration/:durationId')
  async deleteDurationOption(@Param() params: MeetingDurationParams) {
    return await this.meetingDurationService.remove(
      params.meetingId,
      params.durationId,
    );
  }
}
