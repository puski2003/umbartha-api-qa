import { Injectable } from '@nestjs/common';
import { SMSService } from 'src/config/sms/sms.service';

@Injectable()
export class PublicOtpService {
  constructor(private readonly smsService: SMSService) {}

  async otpSend(phone: string) {
    const otpRes = await this.smsService.sendOtp(phone);

    return { phone: phone, ...otpRes };
  }
}
