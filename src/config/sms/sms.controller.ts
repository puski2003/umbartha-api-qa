import { Body, Controller, Post } from '@nestjs/common';
import { SMSService } from './sms.service';

@Controller('sms-service')
export class SMSController {
  constructor(private readonly notifylkService: SMSService) {}

  @Post('otp-send')
  async otpSend(@Body() phone: { phone: string }) {
    return await this.notifylkService.sendOtp(phone.phone);
  }

  @Post('otp-verify')
  async otpVerify(@Body() otpVerify: { otp: number; phone: string }) {
    return await this.notifylkService.verifyOtp(otpVerify.otp, otpVerify.phone);
  }
}
