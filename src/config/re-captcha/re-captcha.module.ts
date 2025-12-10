import { Module } from '@nestjs/common';
import { ReCaptchaController } from './re-captcha.controller';
import { ReCaptchaService } from './re-captcha.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ReCaptchaController],
  providers: [ReCaptchaService],
  exports: [ReCaptchaService],
})
export class ReCaptchaModule {}
