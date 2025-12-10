import { Module } from '@nestjs/common';
import { TestimonialController } from './testimonial.controller';
import { TestimonialService } from './testimonial.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestimonialSchema } from './schema/testimonial.schema';
import { TESTIMONIAL_COLLECTION } from './testimonial.constants';
import { S3Module } from 'src/config/aws/aws-s3/module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TESTIMONIAL_COLLECTION,
        schema: TestimonialSchema,
      },
    ]),
    S3Module,
  ],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
