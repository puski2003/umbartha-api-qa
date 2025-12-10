import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationTemplateService } from './notification.template.service';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';
import { CreateNotificationTemaplateDto } from './dto/create.notification.template.dto';
import { TemplateParseFilePipe } from 'src/config/common/custom/notification-template-parse-file';
import { User } from 'src/config/authorization/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/config/authorization/auth.decorator';
import { Response } from 'express';
import {
  TemplateQueryDto,
  TestimonialParams,
} from './dto/query.notification.template.dto';

@Controller('notification-template')
export class NotificationTemplateController {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  @Auth('cwc')
  @Get()
  async getAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.notificationTemplateService.findAll(limit, page);
  }

  @Get(':templateId')
  async getById(@Param() params: TestimonialParams) {
    return await this.notificationTemplateService.findById(params.templateId);
  }

  @Auth('cwc')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createTemplate(
    @User() user: User,
    @Body() template: CreateNotificationTemaplateDto,
    @UploadedFile(new TemplateParseFilePipe()) file: Express.Multer.File,
  ) {
    return await this.notificationTemplateService.createTemplate(
      user,
      template,
      file,
    );
  }

  @Auth('cwc')
  @Patch(':templateId')
  @UseInterceptors(FileInterceptor('file'))
  async updateTemplate(
    @User() user: User,
    @Param() params: TestimonialParams,
    @UploadedFile(new TemplateParseFilePipe()) file: Express.Multer.File,
  ) {
    return await this.notificationTemplateService.updateTemplate(
      user,
      params.templateId,
      file,
    );
  }

  @Delete(':templateId')
  async deleteTemplate(@Param() params: TestimonialParams) {
    return await this.notificationTemplateService.deleteTestimonial(
      params.templateId,
    );
  }

  /**
   * Endpoint to retrieve and stream an file from S3 based on the provided key and mimetype
   */
  @Get('template/file')
  async getImage(@Query() template: TemplateQueryDto, @Res() res: Response) {
    /**
     * Retrieve a readable stream of the file file from the template
     */
    const fileStream = await this.notificationTemplateService.getTemplate(
      template.key,
    );

    /**
     * Set the Content-Type header based on the mimetype
     */
    res.set({
      'Content-Type': template.mimetype,
    });

    /**
     * Pipe the file stream to the response to send the file content to the client
     */
    fileStream.pipe(res);
  }
}
