import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CounsellorRateService } from './counsellor.rate.service';
import { CreateRateDto } from './dto/create.counsellor.rate';
import { Auth } from 'src/config/authorization/auth.decorator';
import { RateParams, RateQueryDto } from './dto/query.counsellor.rate';
import { UpdateRateDto } from './dto/update.counsellor.rate';
import { User } from 'src/config/authorization/user.decorator';

@Controller('rate')
export class CounsellorRateController {
  constructor(private readonly counsellorRateService: CounsellorRateService) {}

  @Auth('rkk')
  @Get()
  async findAllRates(
    @User() user: User,
    @Query() { limit, page }: RateQueryDto,
  ) {
    return await this.counsellorRateService.findAllRates(user, limit, page);
  }

  @Auth('dhz')
  @Get(':rate')
  async findOneRate(@User() user: User, @Param() params: RateParams) {
    return await this.counsellorRateService.findById(user, params.rate);
  }

  @Auth('qlu')
  @Post()
  async createRate(@User() user: User, @Body() counsellorRate: CreateRateDto) {
    return await this.counsellorRateService.createRate(user, counsellorRate);
  }

  @Auth('lso')
  @Patch(':rate')
  async updateRate(
    @User() user: User,
    @Param() params: RateParams,
    @Body() counsellorRate: UpdateRateDto,
  ) {
    return await this.counsellorRateService.updateSelectedRate(
      user,
      params.rate,
      counsellorRate,
    );
  }

  @Auth('vjl')
  @Delete(':rate')
  async deleteRate(@User() user: User, @Param() params: RateParams) {
    return await this.counsellorRateService.deleteSelectedRate(
      user,
      params.rate,
    );
  }
}
