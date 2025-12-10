import { Module } from '@nestjs/common';
import { SMSController } from './sms.controller';
import { SMSService } from './sms.service';
import { OtpModule } from './otp/otp.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, OtpModule],
  controllers: [SMSController],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
