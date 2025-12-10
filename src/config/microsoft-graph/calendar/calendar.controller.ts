import { Body, Controller, Param, Post } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('microsoft-graph/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('user/:user')
  async scheduleMeeting(@Param() params: any, @Body() event: any) {
    return await this.calendarService.createScheduleMeeting(params.user, event);
  }
}
