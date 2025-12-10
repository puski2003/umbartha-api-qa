import { Body, Controller, Patch, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create.otp.dto';
import { OtpVarificationDto } from './dto/update.otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async createOtp(@Body() body: CreateOtpDto) {
    return await this.otpService.createOtp(body);
  }

  @Patch()
  async otpVarification(@Body() body: OtpVarificationDto) {
    return await this.otpService.otpVarification(body, body.otp);
  }
}
