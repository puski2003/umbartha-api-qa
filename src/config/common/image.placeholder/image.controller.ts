import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageQueryDto } from './dto/image.dto';
import { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('placeholder')
  async getImage(@Query() image: ImageQueryDto, @Res() res: Response) {
    const fileStream = await this.imageService.getPlaceholder(image.key);

    res.set({
      'Content-Type': image.mimetype,
    });
    fileStream.pipe(res);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('placeholder')
  async uploadPlaceholder(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 1000}),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|svg)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.imageService.addPlaceholder(file);
  }

  @Delete('placeholder')
  async deletePhoto(@Query() image: ImageQueryDto) {
    return await this.imageService.removePlaceholder(image.key);
  }
}
