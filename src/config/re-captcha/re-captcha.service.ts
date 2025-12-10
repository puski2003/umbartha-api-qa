import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class ReCaptchaService {
  constructor(private readonly httpService: HttpService) {}

  async verifyingWithRecaptcha(response: string, remoteip?: string) {
    const recaptchaResponse = await this.httpService.axiosRef.post(
      'https://www.google.com/recaptcha/api/siteverify',
      '',
      {
        params: {
          secret: `${process.env.RECAPTCHA_SECRET_KEY}`,
          response: response,
          ...(isNotEmpty(remoteip) ? { remoteip: remoteip } : {}),
        },
      },
    );

    return recaptchaResponse.data;
  }
}
