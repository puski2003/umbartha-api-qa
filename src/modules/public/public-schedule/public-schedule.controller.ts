import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from 'src/modules/schedule/schedule.service';
import {
  BookingQueryDto,
  MeetingTypeQuery,
  PaypalOrderCaptureDto,
  ScheduleParams,
} from './dto/query.public-schedule.dto';
import { PublicScheduleService } from './public-schedule.service';
import { AppointmentDetailsDto } from './dto/update.public-schedule.dto';

@Controller('public/schedule')
export class PublicScheduleController {
  constructor(
    private readonly publicScheduleService: PublicScheduleService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Get()
  async getSchedule(@Query() query: BookingQueryDto) {
    return await this.publicScheduleService.findAll(query);
  }

  @Get(':schedule')
  async getScheduleById(@Param() params: ScheduleParams) {
    return await this.publicScheduleService.findById(params.schedule);
  }

  @Post(':schedule/proceed')
  async bookSchedule(
    @Param() params: ScheduleParams,
    @Query() { meetingBookingType, timezone }: MeetingTypeQuery,
  ) {
    return await this.publicScheduleService.scheduleBookingProceed(
      params.schedule,
      meetingBookingType,
      timezone,
    );
  }

  @Post(':schedule/appointment-detail')
  async createClient(
    @Param() params: ScheduleParams,
    @Body() appointment: AppointmentDetailsDto,
  ) {
    return await this.publicScheduleService.createAppointment(
      params.schedule,
      appointment,
    );
  }

  @Post(':schedule/client-confirm')
  async bookScheduleByClient(@Param() params: ScheduleParams) {
    return await this.publicScheduleService.bookingProceed(params.schedule);
  }

  @Post(':schedule/payment/paypal-order/:order/capture')
  async paypalOrderCapture(@Param() params: PaypalOrderCaptureDto) {
    return await this.publicScheduleService.paypalOrderCapture(
      params.schedule,
      params.order,
    );
  }

  @Post(':schedule/payment/paypal-order/:order/cancel')
  async paypalOrderAuthorizeCanceled(@Param() params: PaypalOrderCaptureDto) {
    return await this.publicScheduleService.paypalOrderAuthorizeCanceled(
      params.schedule,
      params.order,
    );
  }

  @Post(':schedule/payment/paypal-order/:order/error')
  async paypalOrderAuthorizeFailed(@Param() params: PaypalOrderCaptureDto) {
    return await this.publicScheduleService.paypalOrderAuthorizeFailed(
      params.schedule,
      params.order,
    );
  }

  @Patch(':scheduleId/client/:clientId')
  async scheduleBook(@Param() params: any, @Body() data: any) {
    try {
      return await this.scheduleService.bookSchedule(
        params.clientId,
        params.scheduleId,
        data.timeZone,
      );
    } catch (e) {
      console.log('e: ', e);
    }
  }
}
