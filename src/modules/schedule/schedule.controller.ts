import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { ScheduleQueryDto, ScheduleParams } from './dto/query.schedule.dto';
import { User } from 'src/config/authorization/user.decorator';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Auth('jar')
  @Get()
  async findAll(@Query() query: ScheduleQueryDto) {
    return await this.scheduleService.findAll(
      query._search,
      query,
      query.limit,
      query.page,
    );
  }

  @Auth('jar')
  @Get(':scheduleId')
  async findSchedule(@Param() params: ScheduleParams) {
    return await this.scheduleService.findSelectedSchedule(params.scheduleId);
  }

  @Auth('jar')
  @Post()
  async create(@Body() schedule: any) {
    return await this.scheduleService.addSchedules(schedule);
  }

  @Auth('jar')
  @Delete(':scheduleId')
  async deleteSchedule(@Param() params: ScheduleParams) {
    return await this.scheduleService.deleteSchedule(params.scheduleId);
  }

  @Get('overriding/checking')
  async overridingCheck(@Query() params: any) {
    return await this.scheduleService.scheduleOverriding(
      params.counsellor,
      params.startTime,
      params.endTime,
    );
  }

  @Auth('jar')
  @Get('dashborad/calendar')
  async getDashboardCalendarDate(@User() user: User) {
    return await this.scheduleService.dashboardCalendarDate(user);
  }
}
