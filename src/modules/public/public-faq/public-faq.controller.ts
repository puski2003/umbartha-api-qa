import { Controller, Get } from '@nestjs/common';
import { PublicFaqService } from './public-faq.service';
import { FaqService } from 'src/modules/faq/faq.service';

@Controller('public/faq')
export class PublicFaqController {
  constructor(
    private readonly publicFaqService: PublicFaqService,
    private readonly faqService: FaqService,
  ) {}

  @Get()
  async getAll() {
    return (await this.faqService.findAll(undefined, undefined)).docs;
  }
}
