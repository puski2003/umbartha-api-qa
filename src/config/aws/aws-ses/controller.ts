import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SESService } from './service';
import {
  CreateVerifyDto,
  DeleteTemplateDto,
  SendEmailDto,
  SendEmailTemplateDto,
  VerifyEmail,
} from './dto/ses.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ses-client')
export class SESController {
  constructor(private readonly sesService: SESService) {}

  @Post()
  async sendEmail(@Body() email: SendEmailDto) {
    return await this.sesService.sendEmail(email);
  }
}
