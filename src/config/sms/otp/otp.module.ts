import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP_COLLECTION } from './otp.constants';
import { OtpSchema } from './schema/otp.shema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OTP_COLLECTION, schema: OtpSchema }]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
