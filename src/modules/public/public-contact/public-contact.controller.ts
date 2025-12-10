import { Body, Controller, Post } from '@nestjs/common';
import { PublicContactService } from './public-contact.service';
import { ContactService } from 'src/modules/contact/contact.service';
import { CreateContactDto } from 'src/modules/contact/dto/create.contact.dto';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';

@Controller('public/contact')
export class PublicContactController {
  constructor(
    private readonly publicContactService: PublicContactService,
    private readonly contactService: ContactService,
  ) {}

  @Post('request')
  async contactRequest(
    @Body() query: reCaptchaResponse,
    @Body() contactRequest: CreateContactDto,
  ) {
    return this.publicContactService.createRequest(query, contactRequest);
  }
}
