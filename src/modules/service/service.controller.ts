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
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import { CreateServiceDto, ServiceGalleryDto } from './dto/create.service.dto';
import { UpdateServiceDto } from './dto/update.service.dto';
import {
  ChildServiceParam,
  GallerParams,
  GallerQueryDto,
  ServiceQueryDto,
  ServiceParam,
} from './dto/query.service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Auth('yrm')
  @Get()
  async findAllServices(@Query() query: ServiceQueryDto) {
    return await this.serviceService.findAll(query.limit, query.page, query);
  }

  @Auth('jij')
  @Get(':serviceId')
  async findOneService(@Param() param: ServiceParam) {
    return await this.serviceService.findSelectedService(param.serviceId);
  }

  @Auth('kev')
  @Post()
  async createService(
    @User() user: User,
    @Body() createCounsellorDto: CreateServiceDto,
  ) {
    return await this.serviceService.cerateService(user, createCounsellorDto);
  }

  @Auth('vuv')
  @Patch(':serviceId')
  async updateOneService(
    @Param() param: ServiceParam,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.serviceService.updateService(
      param.serviceId,
      updateServiceDto,
    );
  }

  @Auth('czd')
  @Delete(':serviceId')
  async deleteOneService(@Param() param: ServiceParam) {
    return await this.serviceService.deleteSelectedService(param.serviceId);
  }

  @Auth('czd')
  @Delete(':serviceId/group-service/:groupServiceId')
  async removeGroupServiceFromService(@Param() param: ChildServiceParam) {
    return await this.serviceService.removeGroupServiceFromChildService(
      param.serviceId,
      param.groupServiceId,
    );
  }

  // @Auth('kyn')
  @Get('gallery/photo')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    const fileStream = await this.serviceService.imageDataUrl(gallery.key);

    res.set({
      'Content-Type': gallery.mimetype,
    });
    fileStream.pipe(res);
  }

  @Auth('sjs')
  @Put(':serviceId/gallery')
  @UseInterceptors(FileInterceptor('file'))
  async addGallery(
    @Param() param: ServiceParam,
    @Body() gallery: ServiceGalleryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 1000}),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|svg\+xml)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.serviceService.addGalleryToService(
      param.serviceId,
      gallery.gridName,
      file,
    );
  }

  @Auth('ule')
  @Delete(':serviceId/gallery/:galleryId')
  async removeGallery(@Param() params: GallerParams) {
    return await this.serviceService.deleteGallery(
      params.serviceId,
      params.galleryId,
    );
  }
}
