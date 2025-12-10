import { Controller, Get, Query } from '@nestjs/common';
import { PublicTestimonialService } from './public-testimonial.service';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';
import { ServiceParams } from './dto/query.public-testimonial.dto';

@Controller('public/testimonial')
export class PublicTestimonialController {
  constructor(
    private readonly publicTestimonialService: PublicTestimonialService,
  ) {}

  @Get()
  async findAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.publicTestimonialService.findAllForHomePage(limit, page);
  }

  @Get('service')
  async findByService(
    @Query() { limit, page }: PaginationQueryDto,
    @Query() params: ServiceParams,
  ) {
    return await this.publicTestimonialService.findByService(
      limit,
      page,
      params.service,
    );
  }
}
