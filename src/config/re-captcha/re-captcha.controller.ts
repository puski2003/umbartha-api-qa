import { Controller, Get } from '@nestjs/common';
import { ReCaptchaService } from './re-captcha.service';

@Controller('re-captcha')
export class ReCaptchaController {
  constructor(private readonly reCaptchaService: ReCaptchaService) {}

  @Get()
  async get() {
    return await this.reCaptchaService.verifyingWithRecaptcha('d');
  }
}
