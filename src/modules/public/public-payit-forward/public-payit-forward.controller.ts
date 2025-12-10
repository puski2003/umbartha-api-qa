import {
  Body,
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageParseFilePipe } from 'src/config/common/custom/image-parse-file';
import { CreatePayitForwardDto } from 'src/modules/payit-forward/dto/create.payit-forward.dto';
import { PayitForwardService } from 'src/modules/payit-forward/payit-forward.service';

@Controller('public/payit-forward')
export class PublicPayitForwardController {
  constructor(private readonly payitForwardService: PayitForwardService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createNewRecord(
    @Body() payitForward: CreatePayitForwardDto,
    @UploadedFile(new ImageParseFilePipe())
    file: Express.Multer.File,
  ) {
    return await this.payitForwardService.createPayitForward(
      payitForward,
      file,
    );
  }
}
