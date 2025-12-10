import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ClientPhoneParams,
  GetPaymentMethodDto,
  MeetingParams,
} from './dto/public-meeting.dto';
import { PublicMeetingService } from './public-meeting.service';

@Controller('public/meeting')
export class PublicMeetingController {
  constructor(private readonly publicMeetingService: PublicMeetingService) {}

  @Get(':meetingId/data-form')
  async getDataForm(
    @Param() params: MeetingParams,
    @Query() query: ClientPhoneParams,
  ) {
    return await this.publicMeetingService.getDataForm(
      params.meetingId,
      query.email,
    );
  }

  @Get(':meetingId/payment')
  async getPayment(
    @Param() params: MeetingParams,
    @Query() { meetingType }: GetPaymentMethodDto,
  ) {
    return await this.publicMeetingService.getPaymentMethod(
      params.meetingId,
      meetingType,
    );
  }

  @Get('booking/summery')
  async getBookingSummery(@Query() params: any) {
    return await this.publicMeetingService.getBookingSummery(
      params.meetingBooking,
      params.bookingPayment,
    );
  }
}
