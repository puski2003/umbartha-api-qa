import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceSchema } from './schema/service.schema';
import { SERVICE_COLLECTION } from './service.constants';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { EVENT_COLLECTION } from '../event/event.constants';
import { EventSchema } from '../event/schema/event.schema';
import { TESTIMONIAL_COLLECTION } from '../testimonial/testimonial.constants';
import { TestimonialSchema } from '../testimonial/schema/testimonial.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SERVICE_COLLECTION, schema: ServiceSchema },
      { name: EVENT_COLLECTION, schema: EventSchema },
      { name: TESTIMONIAL_COLLECTION, schema: TestimonialSchema },
    ]),
    S3Module,
  ],
  providers: [ServiceService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
