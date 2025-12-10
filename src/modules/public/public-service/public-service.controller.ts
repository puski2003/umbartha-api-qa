import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicServiceService } from './public-service.service';
import { ServiceService } from 'src/modules/service/service.service';
import { ServiceParam } from 'src/modules/service/dto/query.service.dto';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';

@Controller('public/service')
export class PublicServiceController {
  constructor(
    private readonly publicServiceService: PublicServiceService,
    private readonly serviceService: ServiceService,
  ) {}

  @Get()
  async getALl(@Query() { limit, page }: PaginationQueryDto) {
    return await this.publicServiceService.findAll(limit, page);
  }

  @Get(':serviceId')
  async getById(@Param() params: ServiceParam) {
    return this.serviceService.findSelectedService(params.serviceId);
  }
}
