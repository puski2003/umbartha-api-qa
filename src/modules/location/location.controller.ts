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
import { LocationService } from './location.service';
import {
  CreateClosedDatePlaneDto,
  CreateLocationDto,
  UploadGalleryDto,
} from './dto/create.location.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/config/authorization/user.decorator';
import { Auth } from 'src/config/authorization/auth.decorator';
import { Response } from 'express';
import {
  ClosedDatePlanParams,
  GallerQueryDto,
  GalleryParams,
  LocationParam,
  PaginationQueryDto,
} from './dto/query.location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Auth('jar')
  @Get()
  async findAllLocation(@Query() { limit, page }: PaginationQueryDto) {
    return await this.locationService.findAll(limit, page);
  }

  @Auth('jar')
  @Get(':locationId')
  async findOneLocation(@Param() params: LocationParam) {
    return await this.locationService.findSelectedLocation(params.locationId);
  }

  @Auth('jar')
  @Post()
  async creteLocation(
    @User() user: User,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return await this.locationService.createLocation(user, createLocationDto);
  }

  @Auth('jar')
  @Patch(':locationId')
  async update(@Param() params: LocationParam, @Body() updateLocationDto: any) {
    return await this.locationService.updateLocation(
      params.locationId,
      updateLocationDto,
    );
  }

  @Auth('jar')
  @Delete(':locationId')
  async remove(@Param() params: LocationParam) {
    return await this.locationService.removeLocation(params.locationId);
  }

  // @Auth('')
  @Get('gallery/photo')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    const fileStream = await this.locationService.getImage(gallery.key);

    res.set({
      'Content-Type': gallery.mimetype,
    });
    fileStream.pipe(res);
  }

  @Auth('jar')
  @Put(':locationId/gallery')
  @UseInterceptors(FileInterceptor('file'))
  async uploadGallery(
    @Param() params: LocationParam,
    @Body() uploadGalleryDto: UploadGalleryDto,
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
    return await this.locationService.addGalleryForLocation(
      params.locationId,
      uploadGalleryDto,
      file,
    );
  }

  @Auth('jar')
  @Delete(':locationId/gallery/:galleryId')
  async removeGallery(@Param() params: GalleryParams) {
    return await this.locationService.removeGalleryFromLocation(
      params.locationId,
      params.galleryId,
    );
  }

  @Auth('jar')
  @Put(':locationId/closed-date-plan')
  async updateClosedDatePlan(
    @Param() params: LocationParam,
    @Body() createClosedDatePlaneDto: CreateClosedDatePlaneDto,
  ) {
    return await this.locationService.addClosedDatePlaneForLocation(
      params.locationId,
      createClosedDatePlaneDto,
    );
  }

  @Auth('jar')
  @Delete(':locationId/closed-date-plan/:closedDatePlanId')
  async removeClosedDatePlane(@Param() params: ClosedDatePlanParams) {
    return await this.locationService.removeClosedDatePlan(
      params.locationId,
      params.closedDatePlanId,
    );
  }
}
