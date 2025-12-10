import { Injectable } from '@nestjs/common';
import { OtpService } from './otp/otp.service';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import { OtpStatus } from './otp/schema/otp.shema';
import * as twilio from 'twilio';
import { isNotEmpty } from 'class-validator';
import Handlebars from 'handlebars';

@Injectable()
export class SMSService {
  private twilioClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly otpService: OtpService,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Only initialize Twilio if credentials are provided
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async sendTemplateSMS(phone: string, template: string) {
    let otpSendRes;
    if (phone.slice(1, 4) === '+94' || phone.slice(1, 3) === '94')
      otpSendRes = await this.httpService.axiosRef
        .post(
          `https://app.notify.lk/api/v1/send?user_id=${process.env.NOTIFY_USER_ID}&api_key=${process.env.NOTIFY_API_KEY}&sender_id=${process.env.NOTIFY_SENDER_ID}&to=${phone}&message=${template}
    `,
        )
        .catch((e) => {
          console.error(e.message);

          throw e;
        });
    else
      otpSendRes = await this.twilioClient.messages
        .create({
          body: template,
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
          to: phone,
        })
        .catch((e) => {
          console.error(e.message);

          throw e;
        });

    if (
      otpSendRes?.data?.status === 'success' ||
      otpSendRes?.status === 'accepted'
    ) {
      await this.otpService.updateOtp(
        { phone: phone },
        { status: OtpStatus.SEND },
      );

      return {
        to: phone,
        status: otpSendRes?.data?.status || otpSendRes?.status,
        dateUpdated: isNotEmpty(otpSendRes?.dateUpdated)
          ? otpSendRes?.dateUpdated
          : new Date(),
      };
    } else {
      return await this.sendOtp(phone);
    }
  }

  async sendOtp(phone: string) {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        '../../modules/notification.template/templates.files/OTPVerificationSMS.txt',
      ),
    );

    const otpCreateRes = await this.otpService.createOtp({ phone: phone });

    const otpTemplate = Handlebars.compile(source.toString());

    const otpData = {
      OTPCode: otpCreateRes.otp.toString(),
    };

    let otpSendRes;
    if (phone.slice(1, 4) === '+94' || phone.slice(1, 3) === '94')
      otpSendRes = await this.httpService.axiosRef
        .post(
          `https://app.notify.lk/api/v1/send?user_id=${
            process.env.NOTIFY_USER_ID
          }&api_key=${process.env.NOTIFY_API_KEY}&sender_id=${
            process.env.NOTIFY_SENDER_ID
          }&to=${phone}&message=${otpTemplate(otpData).toString()}
    `,
        )
        .catch((e) => {
          console.error(e.message);

          throw e;
        });
    else
      otpSendRes = await this.twilioClient.messages
        .create({
          body: otpTemplate(otpData).toString(),
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
          to: phone,
        })
        .catch((e) => {
          console.error(e.message);

          throw e;
        });

    if (
      otpSendRes?.data?.status === 'success' ||
      otpSendRes?.status === 'accepted'
    ) {
      await this.otpService.updateOtp(
        { phone: phone },
        { status: OtpStatus.SEND },
      );

      return {
        to: phone,
        status: otpSendRes?.data?.status || otpSendRes?.status,
        dateUpdated: isNotEmpty(otpSendRes?.dateUpdated)
          ? otpSendRes?.dateUpdated
          : new Date(),
      };
    } else {
      return await this.sendOtp(phone);
    }
  }

  async verifyOtp(otp: number, phone: string) {
    return await this.otpService.otpVarification({ phone: phone }, otp);
  }
}
