import { Module } from '@nestjs/common';
import { PublicOtpController } from './public-otp.controller';
import { PublicOtpService } from './public-otp.service';
import { SMSModule } from 'src/config/sms/sms.module';

@Module({
  imports: [SMSModule],
  controllers: [PublicOtpController],
  providers: [PublicOtpService],
})
export class PublicOtpModule {}
