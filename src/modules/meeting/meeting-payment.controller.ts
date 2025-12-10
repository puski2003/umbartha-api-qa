import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { MeetingPaymentService } from './meeting-payment.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { MeetingOptionParams } from './dto/query.meeting.dto';
import { CreateOverrideDto } from './dto/create.meeting.dto';

@Controller('meeting')
export class MeetingPaymentController {
  constructor(private readonly meetingPaymentService: MeetingPaymentService) {}

  @Auth('jar')
  @Get(':meetingId/available/:optionId')
  async findOption(@Param() params: MeetingOptionParams) {
    return await this.meetingPaymentService.findAvailableOption(
      params.meetingId,
      params.optionId,
    );
  }

  @Auth('jar')
  @Put(':meetingId/available/:optionId')
  addOption(
    @Param() params: MeetingOptionParams,
    @Body() override: CreateOverrideDto,
  ) {
    return this.meetingPaymentService.addAvailableOption(
      params.meetingId,
      params.optionId,
      override,
    );
  }

  @Auth('jar')
  @Delete(':meetingId/available/:optionId')
  removeOption(@Param() params: MeetingOptionParams) {
    return this.meetingPaymentService.removeOption(
      params.meetingId,
      params.optionId,
    );
  }

  // @Auth('jar')
  // @Put('override/:optionId')
  // addOverride(
  //   @Param('meetingId') meetingId: string,
  //   @Param('optionId') optionId: string,
  //   @Body() createOverrideDto: CreateOverrideDto,
  // ) {
  //   return this.meetingPaymentService.create(
  //     meetingId,
  //     optionId,
  //     createOverrideDto,
  //   );
  // }

  // // @Patch('override/:optionId')
  // // updateOverride(
  // //   @Param('meetingId') meetingId: string,
  // //   @Param('optionId') optionId: string,
  // //   @Body() updateOverrideDto: UpdateOverrideDto,
  // // ) {
  // //   return this.meetingPaymentService.update(
  // //     meetingId,
  // //     optionId,
  // //     updateOverrideDto,
  // //   );
  // // }

  // @Delete('override/:optionId')
  // removeOverride(
  //   @Param('meetingId') meetingId: string,
  //   @Param('optionId') optionId: string,
  // ) {
  //   return this.meetingPaymentService.remove(meetingId, optionId);
  // }
}
