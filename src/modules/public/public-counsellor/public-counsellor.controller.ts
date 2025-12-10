import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicCounsellorService } from './public-counsellor.service';
import {
  CounsellorGetParam,
  CounsellorQueryDto,
} from './dto/public-counsellor.dto';

@Controller('/public/counsellor')
export class PublicCounsellorController {
  constructor(
    private readonly counsellorllorService: PublicCounsellorService,
  ) {}

  @Get()
  getPublicCounsellors(@Query() query: CounsellorQueryDto) {
    return this.counsellorllorService.findAll(query);
  }

  @Get('/:counsellorId')
  getOnePublicCounsellor(@Param() param: CounsellorGetParam) {
    return this.counsellorllorService.findOne(param.counsellorId);
  }
}
