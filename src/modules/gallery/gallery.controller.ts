import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  GallerQueryDto,
  GalleryParamsDto,
  PaginationQueryDto,
  PhotoParams,
} from './dto/query.gallery.dto';
import { CreateGalleryDto } from './dto/create.gallery.dto';
import { UpdateGalleryDto } from './dto/update.gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { isEmpty } from 'class-validator';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Auth('yrm')
  @Get()
  async findAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.galleryService.findAllGallery(limit, page);
  }

  @Auth('yrm')
  @Get(':galleryId')
  async getById(@Param() params: GalleryParamsDto) {
    return await this.galleryService.findSelectedGallery(params.galleryId);
  }

  @Auth('yrm')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createNewGallery(
    @Body() gallery: CreateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (isEmpty(file)) {
      throw new BadRequestException('file is required');
    }

    return await this.galleryService.createGallery(gallery, file);
  }

  @Auth('yrm')
  @Patch(':galleryId')
  @UseInterceptors(FileInterceptor('file'))
  async updateGallery(
    @Param() params: GalleryParamsDto,
    @Body() gallery: UpdateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.galleryService.updatedGallery(
      params.galleryId,
      gallery,
      file,
    );
  }

  @Auth('yrm')
  @Patch(':galleryId/visibility')
  async changeVisibility(@Param() params: GalleryParamsDto) {
    return await this.galleryService.changeVisibility(params.galleryId);
  }

  @Get('image/photo')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    const fileStream = await this.galleryService.getImage(gallery.key);

    res.set({
      'Content-Type': gallery.mimetype,
    });
    fileStream.pipe(res);
  }

  @Auth('yrm')
  @Put(':galleryId/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param() params: GalleryParamsDto,
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
    return await this.galleryService.addImageToGallery(params.galleryId, file);
  }

  @Auth('yrm')
  @Delete(':galleryId/image/:imageId')
  async deleteImage(@Param() params: PhotoParams) {
    return await this.galleryService.removeImageFromGallery(
      params.galleryId,
      params.imageId,
    );
  }

  @Auth('yrm')
  @Delete(':galleryId')
  async deleteGallery(@Param() params: GalleryParamsDto) {
    return await this.galleryService.deleteGallery(params.galleryId);
  }
}
