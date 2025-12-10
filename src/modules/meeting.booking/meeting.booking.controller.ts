import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { MeetingBookingService } from './meeting.booking.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  MeetingBookingParam,
  PaginationQueryDto,
} from './dto/query.meeting.booking.dto';
import { MeetingBookingStatusDto } from './dto/update.meeting.booking.dto';
import { User } from 'src/config/authorization/user.decorator';

@Controller('meeting-booking/booking')
export class MeetingBookingController {
  constructor(private readonly meetingBookingService: MeetingBookingService) {}

  @Auth('jar')
  @Get()
  async findAllMeetingBooking(
    @User() user: User,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.meetingBookingService.findAll(
      user,
      query.limit,
      query.page,
      query,
    );
  }

  @Auth('jar')
  @Get('counsellor/client')
  async findAllClient(@User() user: User, @Query() query: PaginationQueryDto) {
    return await this.meetingBookingService.findAllBookingClient(
      user,
      query.limit,
      query.page,
      query,
    );
  }

  @Auth('jar')
  @Get(':meetingBookingId')
  async findOneMeetingBooking(@Param() params: MeetingBookingParam) {
    return await this.meetingBookingService.findById(params.meetingBookingId);
  }

  @Auth('jar')
  @Delete(':meetingBookingId')
  async deleteSelectedMeetingBooking(@Param() params: MeetingBookingParam) {
    return await this.meetingBookingService.deleteById(params.meetingBookingId);
  }

  @Auth('jar')
  @Patch('status/:meetingBookingId')
  async changeMeetingBookingStatus(
    @Param() params: MeetingBookingParam,
    @Body() body: MeetingBookingStatusDto,
  ) {
    return await this.meetingBookingService.changeMeetingBookingStatus(
      params.meetingBookingId,
      body.status,
    );
  }

  @Auth('jar')
  @Get('dashborad/graph')
  async getMeetingBookingForWeek(@User() user: User) {
    return await this.meetingBookingService.appointmentGraphData(user);
  }
}
