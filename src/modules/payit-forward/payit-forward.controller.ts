import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PayitForwardService } from './payit-forward.service';
import {
  AttachmentQueryDto,
  PaginationQueryDto,
  PayitForwardParams,
} from './dto/query.payit-forward.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePayitForwardDto } from './dto/create.payit-forward.dto';
import { Response } from 'express';
import { Auth } from 'src/config/authorization/auth.decorator';

@Controller('payit-forward')
export class PayitForwardController {
  constructor(private readonly payitForwardService: PayitForwardService) {}

  @Auth('yrm')
  @Get()
  async findAllRecords(@Query() paginationQuery: PaginationQueryDto) {
    return await this.payitForwardService.findAll(
      paginationQuery.limit,
      paginationQuery.page,
    );
  }

  @Auth('yrm')
  @Get(':payitForwardId')
  async findOneRecord(@Param() params: PayitForwardParams) {
    return await this.payitForwardService.findSelectedPayitForward(
      params.payitForwardId,
    );
  }

  @Auth('yrm')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createNewRecord(
    @Body() payitForward: CreatePayitForwardDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 1000}),
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|png|webp|svg)|application\/pdf)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.payitForwardService.createPayitForward(
      payitForward,
      file,
    );
  }

  @Auth('yrm')
  @Patch(':payitForwardId')
  async payitForwardAcknowledge(@Param() params: PayitForwardParams) {
    return await this.payitForwardService.acknowledgePayitForward(
      params.payitForwardId,
    );
  }

  @Auth('yrm')
  @Delete(':payitForwardId')
  async deleteRecord(@Param() params: PayitForwardParams) {
    return await this.payitForwardService.deletePayitForward(
      params.payitForwardId,
    );
  }

  @Get('attachment/file')
  async getImage(
    @Query() attachment: AttachmentQueryDto,
    @Res() res: Response,
  ) {
    const fileStream = await this.payitForwardService.getFile(attachment.key);

    res.set({
      'Content-Type': attachment.mimetype,
    });
    fileStream.pipe(res);
  }
}
