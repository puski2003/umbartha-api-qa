import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PublicEventService } from './public-event.service';
import { EventParam } from 'src/modules/event/dto/event.dto';
import {
  CreateEventRegistrationDto,
  PhoneVerificationDto,
} from 'src/modules/event/dto/event-registration.dto';
import { EventRegistrationService } from 'src/modules/event/event-registration.service';
import { PaginationDto } from './dto/public-event.dto';

@Controller('public/event')
export class PublicEventController {
  constructor(
    private readonly publicEventService: PublicEventService,
    private readonly registrationService: EventRegistrationService,
  ) {}

  @Get('ongoing')
  async getAllOngoingEvent(@Query() query: PaginationDto) {
    return this.publicEventService.findAllOngoingEvent(query);
  }

  @Get('past')
  async getAllPastEvent(@Query() query: PaginationDto) {
    return this.publicEventService.findAllPastEvent(query);
  }

  @Get(':eventId')
  async findOne(@Param() param: EventParam) {
    return this.publicEventService.findOne(param.eventId);
  }

  @Post('registration')
  async createRegistration(@Body() registration: CreateEventRegistrationDto) {
    return await this.registrationService.registrationOTPVerify(registration);
  }

  @Post('registation/otp-send')
  async OTPSend(@Body() otpVerification: PhoneVerificationDto) {
    return await this.registrationService.registrationOTPSend(
      otpVerification.phone,
    );
  }

  // @Post('registation/otp-verify')
  // async OTPVerify(@Body() registration: PhoneVerifyDto) {
  //   return await this.registrationService.registrationOTPVerify(
  //     registration.otp,
  //     registration.registation,
  //   );
  // }
}
