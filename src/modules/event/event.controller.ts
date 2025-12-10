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
import { EventService } from './event.service';
import {
  CreateEventDto,
  CreateSpeakersDto,
  CreateTimingsDto,
  EventParam,
  GallerQueryDto,
  GalleryDto,
  GalleryParam,
  ImgaeDto,
  PaginationQueryDto,
  SpeakersParam,
  TimingsParam,
  UpdateLocationDto,
} from './dto/event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAllEvent(@Query() { limit, page }: PaginationQueryDto) {
    return await this.eventService.findAll(limit, page);
  }

  @Get(':eventId')
  async findEvent(@Param() param: EventParam) {
    return await this.eventService.findSelectedEvent(param.eventId);
  }

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.createEvent(createEventDto);
  }

  @Delete(':eventId')
  async deleteEvent(@Param() param: EventParam) {
    return await this.eventService.deleteEvent(param.eventId);
  }

  @Put(':eventId/timing')
  async addTiming(
    @Param() param: EventParam,
    @Body() timings: CreateTimingsDto,
  ) {
    return await this.eventService.addTimingsForEvent(param.eventId, timings);
  }

  @Delete(':eventId/timing/:timingId')
  async removeTiming(@Param() param: TimingsParam) {
    return await this.eventService.removeTimingsFromEvent(
      param.eventId,
      param.timingId,
    );
  }

  @Patch(':eventId/location')
  async updateLocation(
    @Param() param: EventParam,
    @Body() location: UpdateLocationDto,
  ) {
    return await this.eventService.updateLocation(param.eventId, location);
  }

  @Put(':eventId/speaker')
  async addSpeaker(
    @Param() param: EventParam,
    @Body() speaker: CreateSpeakersDto,
  ) {
    return await this.eventService.addSpeakerForEvent(param.eventId, speaker);
  }

  @Delete(':eventId/speaker/:speakerId')
  async removeSpeaker(@Param() param: SpeakersParam) {
    return await this.eventService.removeSpeakerFromEvent(
      param.eventId,
      param.speakerId,
    );
  }

  @Post(':eventId/gallery')
  @UseInterceptors(FileInterceptor('file'))
  async addGalleryForEvent(
    @Param() param: EventParam,
    @Body() gallery: GalleryDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return await this.eventService.addGalleryForEvent(
      param.eventId,
      gallery,
      file,
    );
  }

  @Patch(':eventId/gallery/:galleryId')
  async updateFeaturedImage(@Param() param: GalleryParam) {
    return await this.eventService.changeFeatureImage(
      param.eventId,
      param.galleryId,
    );
  }

  @Delete(':eventId/gallery/:galleryId')
  async removeGalleryFromEvent(@Param() param: GalleryParam) {
    return await this.eventService.removeGalleryFromEvent(
      param.eventId,
      param.galleryId,
    );
  }

  @Post('gallery')
  @UseInterceptors(FileInterceptor('file'))
  async imageUpdate(
    @Body() image: ImgaeDto,
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
    return await this.eventService.imageUrl(
      image.buckectName,
      image.folderName,
      file.originalname,
      file.mimetype,
      file.buffer,
    );
  }

  @Get('gallery/base64')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    const fileStream = await this.eventService.imageDataUrl(gallery.key);

    res.set({
      'Content-Type': gallery.mimetype,
    });
    fileStream.pipe(res);
  }
}
