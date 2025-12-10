import { Module } from '@nestjs/common';
import { PublicTestimonialService } from './public-testimonial.service';
import { PublicTestimonialController } from './public-testimonial.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialSchema } from 'src/modules/testimonial/schema/testimonial.schema';
import { TESTIMONIAL_COLLECTION } from 'src/modules/testimonial/testimonial.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TESTIMONIAL_COLLECTION,
        schema: TestimonialSchema,
      },
    ]),
  ],
  providers: [PublicTestimonialService],
  controllers: [PublicTestimonialController],
})
export class PublicTestimonialModule {}
