import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FAQ, FAQSchema } from './schema/faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FAQ.name,
        schema: FAQSchema,
      },
    ]),
  ],
  providers: [FaqService],
  controllers: [FaqController],
  exports: [FaqService],
})
export class FaqModule {}
