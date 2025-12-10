import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create.meeting.dto';
import { UpdateMeetingDto } from './dto/update.meeting.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import { MeetingParams, PaginationQueryDto } from './dto/query.meeting.dto';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Auth('jar')
  @Get()
  findAll(@User() user: User, @Query() { limit, page }: PaginationQueryDto) {
    return this.meetingService.findAll(user, limit, page);
  }

  @Auth('jar')
  @Get(':meetingId')
  findOne(@Param() params: MeetingParams) {
    return this.meetingService.findSelectedMeeting(params.meetingId);
  }

  @Auth('jar')
  @Post()
  crete(@User() user: User, @Body() meeting: CreateMeetingDto) {
    return this.meetingService.createMeeting(user, meeting);
  }

  @Auth('jar')
  @Patch(':meetingId')
  update(@Param() params: MeetingParams, @Body() meeting: UpdateMeetingDto) {
    return this.meetingService.updateMeeting(params.meetingId, meeting);
  }

  @Auth('jar')
  @Delete(':meetingId')
  remove(@Param() params: MeetingParams) {
    return this.meetingService.deleteMeeting(params.meetingId);
  }
}
