import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { MeetingNotificationService } from './meeting-notification.service';
import { CreateMeetingNotificationDto } from './dto/create.meeting.dto';
import {
  MeetingNotificationParams,
  MeetingParams,
} from './dto/query.meeting.dto';
import { Auth } from 'src/config/authorization/auth.decorator';

@Controller('/meeting')
export class MeetingNotificationController {
  constructor(
    private readonly meetingNotificationService: MeetingNotificationService,
  ) {}

  @Auth('jar')
  @Get(':meetingId/notification/:notificationId')
  async findNotification(@Param() params: MeetingNotificationParams) {
    return await this.meetingNotificationService.findSelectedMeetingNotification(
      params.meetingId,
      params.notificationId,
    );
  }

  @Auth('jar')
  @Put(':meetingId/notification')
  async addNotification(
    @Param() params: MeetingParams,
    @Body() notification: CreateMeetingNotificationDto,
  ) {
    return await this.meetingNotificationService.addNotificationForMeeting(
      params.meetingId,
      notification,
    );
  }

  // @Patch(':notificationId')
  // updateNotification(
  //   @Param('meetingId') meetingId: string,
  //   @Param('notificationId') notificationId: string,
  //   @Body() updateMeetingNotificationDto: UpdateMeetingNotificationDto,
  // ) {
  //   return this.meetingNotificationService.update(
  //     meetingId,
  //     notificationId,
  //     updateMeetingNotificationDto,
  //   );
  // }

  @Auth('jar')
  @Delete(':meetingId/notification/:notificationId')
  async removeNotification(@Param() params: MeetingNotificationParams) {
    return await this.meetingNotificationService.removeNotificationFromMeeting(
      params.meetingId,
      params.notificationId,
    );
  }
}
