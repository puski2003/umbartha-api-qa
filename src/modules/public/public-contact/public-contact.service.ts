import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';
import { ContactService } from 'src/modules/contact/contact.service';

@Injectable()
export class PublicContactService {
  constructor(private readonly contactService: ContactService) {}

  async createRequest(query: reCaptchaResponse, request: any) {
    const createdRequest = await this.contactService
      .createContactRequest(query, request)
      .catch(async (e) => {
        Logger.debug('REQUEST FAIL');
        throw new BadRequestException(`REQUEST FAIL: ${e}`);
      });
    return createdRequest;
  }

  async getAllRequests() {
    const requests = (await this.contactService.getAll(undefined, undefined))
      .docs;
    return requests;
  }
}
