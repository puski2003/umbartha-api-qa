import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { ContactParamsDto, PaginationQueryDto } from './dto/query.contact.dto';
import { CreateContactDto } from './dto/create.contact.dto';
import { User } from 'src/config/authorization/user.decorator';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';

@Controller('contact-request')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Auth('jar')
  @Get()
  async findAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.contactService.getAll(limit, page);
  }

  @Auth('jar')
  @Get(':requestId')
  async findRequest(@Param() params: ContactParamsDto) {
    return await this.contactService.findSelectedRequest(params.requestId);
  }

  @Auth('jar')
  @Post()
  async createRequest(
    @Body() query: reCaptchaResponse,
    @Body() request: CreateContactDto,
  ) {
    return await this.contactService.createContactRequest(query, request);
  }

  @Auth('jar')
  @Delete(':requestId')
  async deleteRequest(@Param() params: ContactParamsDto) {
    return await this.contactService.deleteContactRequest(params.requestId);
  }

  @Auth('jar')
  @Patch(':requestId')
  async requestAcknowledge(
    @User() user: User,
    @Param() params: ContactParamsDto,
  ) {
    return await this.contactService.requestAcknowledge(user, params.requestId);
  }
}
