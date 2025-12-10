import { Body, Controller, Post } from '@nestjs/common';
import { OTPSendDto, OTPVerifyDto } from './dto/public-otp.dto';
import { PublicOtpService } from './public-otp.service';
import { SMSService } from 'src/config/sms/sms.service';

@Controller('public/otp')
export class PublicOtpController {
  constructor(
    private readonly publicOtpService: PublicOtpService,
    private readonly smsService: SMSService,
  ) {}

  @Post('send')
  async otpSend(@Body() params: OTPSendDto) {
    return await this.publicOtpService.otpSend(params.phone);
  }

  @Post('verify')
  async otpVerify(@Body() params: OTPVerifyDto) {
    return await this.smsService.verifyOtp(params.otp, params.phone);
  }
}
