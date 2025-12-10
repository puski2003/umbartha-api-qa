import { Module } from '@nestjs/common';
import { PublicFaqController } from './public-faq.controller';
import { PublicFaqService } from './public-faq.service';
import { FaqModule } from 'src/modules/faq/faq.module';

@Module({
  imports: [FaqModule],
  providers: [PublicFaqService],
  controllers: [PublicFaqController],
})
export class PublicFaqModule {}
