import { Controller, Get, Query } from '@nestjs/common';
import { PaginationQueryDto } from 'src/modules/gallery/dto/query.gallery.dto';
import { PublicGalleryService } from './public-gallery.service';

@Controller('public/gallery')
export class PublicGalleryController {
  constructor(private readonly publicGalleryService: PublicGalleryService) {}

  @Get()
  async findAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.publicGalleryService.findPublicGallery(limit, page);
  }
}
