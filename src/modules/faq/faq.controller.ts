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
import { FaqService } from './faq.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { FAQParams, PaginationQueryDto } from './dto/query.faq.dto';
import { CerateFaqDto } from './dto/create.faq.dto';
import { ChangeOrderDto, UpdateFaqDto } from './dto/update.faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Auth('jar')
  @Get()
  async findAll(@Query() { limit, page }: PaginationQueryDto) {
    return await this.faqService.findAll(limit, page);
  }

  @Auth('jar')
  @Get(':faqId')
  async findFAQ(@Param() params: FAQParams) {
    return await this.faqService.findSelectedFaq(params.faqId);
  }

  @Auth('jar')
  @Post()
  async createFaq(@Body() faq: CerateFaqDto) {
    return await this.faqService.createFaq(faq);
  }

  @Auth('jar')
  @Patch(':faqId')
  async updateFaq(@Param() params: FAQParams, @Body() faq: UpdateFaqDto) {
    return await this.faqService.updateSelectedFaq(params.faqId, faq);
  }

  @Auth('jar')
  @Delete(':faqId')
  async deleteFaq(@Param() params: FAQParams) {
    return await this.faqService.deleteSelectedFaq(params.faqId);
  }

  @Auth('jar')
  @Patch(':faqId/order')
  async changeOrder(
    @Param() params: FAQParams,
    @Body() { order }: ChangeOrderDto,
  ) {
    return await this.faqService.orderChangeSelectedFaq(params.faqId, order);
  }
}
