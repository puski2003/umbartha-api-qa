import {
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  Body,
  UploadedFile,
  Patch,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import { ImageParseFilePipe } from 'src/config/common/custom/image-parse-file';
import { CreateTestimonialDto } from './dto/create.testimonial.dto';
import {
  TestimonialParams,
  GallerQueryDto,
  PhotoParams,
} from './dto/query.testimonial.dto';
import { UpdateTestimonialDto } from './dto/update.testimonial.dto';
import { Response } from 'express';
import { TestimonialService } from './testimonial.service';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';

@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Auth('bim')
  @Get()
  async findAll(
    @User() user: User,
    @Query() { limit, page }: PaginationQueryDto,
  ) {
    return await this.testimonialService.findAll(user, limit, page);
  }

  @Auth('gsv')
  @Get(':testimonialId')
  async findOne(@User() user: User, @Param() params: TestimonialParams) {
    return await this.testimonialService.findSelectedTestimonial(
      user,
      params.testimonialId,
    );
  }

  @Auth('lvq')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createTestimonial(
    @Body() testimonial: CreateTestimonialDto,
    @UploadedFile(new ImageParseFilePipe()) file: Express.Multer.File,
  ) {
    return await this.testimonialService.createdSelectedTestimonial(
      testimonial,
      file,
    );
  }

  @Auth('cwc')
  @Patch(':testimonialId')
  @UseInterceptors(FileInterceptor('file'))
  async updateTestimonial(
    @User() user: User,
    @Param() params: TestimonialParams,
    @Body() testimonial: UpdateTestimonialDto,
    @UploadedFile(new ImageParseFilePipe()) file: Express.Multer.File,
  ) {
    return await this.testimonialService.updateSelectedTestimonial(
      user,
      params.testimonialId,
      testimonial,
      file,
    );
  }

  @Auth('zau')
  @Delete(':testimonialId')
  async deleteTestimonial(
    @User() user: User,
    @Param() params: TestimonialParams,
  ) {
    return await this.testimonialService.deleteTestimonial(
      user,
      params.testimonialId,
    );
  }

  /**
   * Endpoint to retrieve and stream an image from S3 based on the provided key and mimetype
   */
  @Get('gallery/photo')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    /**
     * Retrieve a readable stream of the image file from the testimonial
     */
    const fileStream = await this.testimonialService.getImage(gallery.key);

    /**
     * Set the Content-Type header based on the mimetype
     */
    res.set({
      'Content-Type': gallery.mimetype,
    });

    /**
     * Pipe the file stream to the response to send the image content to the client
     */
    fileStream.pipe(res);
  }

  @Auth('nqa')
  @Delete(':testimonialId/photo/:photoId')
  async deletePhoto(@Param() params: PhotoParams) {
    return await this.testimonialService.removeImageFromTestimonial(
      params.testimonialId,
      params.photoId,
    );
  }
}
