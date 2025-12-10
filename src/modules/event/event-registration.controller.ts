import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { EventRegistrationService } from './event-registration.service';
import {
  CreateEventRegistrationDto,
  EmailVerificationDto,
  EmailVerifyDto,
  EventRegistrationParam,
  EventRegistrationQueryDto,
  PhoneVerificationDto,
  UpdateRegisteredEventDto,
} from './dto/event-registration.dto';

@Controller('event-registration')
export class EventRegistrationController {
  constructor(private readonly registrationService: EventRegistrationService) {}

  @Get()
  async getAll(@Query() { limit, page, ...query }: EventRegistrationQueryDto) {
    return await this.registrationService.findAll(limit, page, query);
  }

  @Get(':registrationId')
  async finBydId(@Param() params: EventRegistrationParam) {
    return await this.registrationService.findSelectedRegistration(
      params.registrationId,
    );
  }

  @Post()
  async createRegistration(@Body() registration: CreateEventRegistrationDto) {
    return await this.registrationService.createRegistration(registration);
  }

  @Patch(':registrationId')
  async updateRegistration(
    @Param() params: EventRegistrationParam,
    @Body() registation: UpdateRegisteredEventDto,
  ) {
    return await this.registrationService.updateSelectedRegistration(
      params.registrationId,
      registation,
    );
  }

  @Delete(':registrationId')
  async deleteRegitration(@Param() params: EventRegistrationParam) {
    return await this.registrationService.deleteRegistration(
      params.registrationId,
    );
  }

  @Post('phone/otp-send')
  async OTPSend(@Body() otpVerification: PhoneVerificationDto) {
    return await this.registrationService.registrationOTPSend(
      otpVerification.phone,
    );
  }

  // @Post('phone/otp-verify')
  // async OTPVerify(@Body() registration: PhoneVerifyDto) {
  //   return await this.registrationService.registrationOTPVerify(
  //     registration.otp,
  //     registration.registation,
  //   );
  // }

  @Get(':registrationId/email/email-verify-link')
  async createEmailVerifyLink(
    @Param() params: EventRegistrationParam,
    @Query() data: EmailVerificationDto,
  ) {
    return await this.registrationService.registrationEmailVerifyLink(
      params.registrationId,
      data.email,
    );
  }

  @Redirect()
  @Get(':registrationId/email/email-verify')
  async emailVerify(
    @Param() params: EventRegistrationParam,
    @Query() data: EmailVerifyDto,
  ) {
    return await this.registrationService
      .registrationEmailVerify(params.registrationId, data)
      .then(async () => {
        return { url: 'https://i.imgflip.com/4lfgu3.jpg' };
      })
      .catch((e) => {
        Logger.debug(e);
        return {
          url: 'https://th.bing.com/th/id/OIP.veVmyc8_KnTqZ51skCQ2ngHaE8?pid=ImgDet&w=191&h=127.0224609375&c=7&dpr=1.3',
        };
      });
  }

  @Get('service/registration')
  async getServiceRegistation(
    @Query() { limit, page, ...filter }: EventRegistrationQueryDto,
  ) {
    return await this.registrationService.getServiceRegistation(
      limit,
      page,
      filter,
    );
  }
}
