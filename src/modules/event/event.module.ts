import { Module } from '@nestjs/common';
import { EventCategoryController } from './event-category.controller';
import { EventCategoryService } from './event-category.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EVENT_CATEGORY_COLLECTION,
  EVENT_COLLECTION,
  EVENT_REGIST_COLLECTION,
} from './event.constants';
import { EventCategorySchema } from './schema/event-category.schema';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventSchema } from './schema/event.schema';
import { EventRegistrationSchema } from './schema/event-registration.schema';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { JwtModule } from '@nestjs/jwt';
import { EventRegistrationController } from './event-registration.controller';
import { EventRegistrationService } from './event-registration.service';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { SUBSCRIPTION_COLLECTION } from '../subscription/subscription.constants';
import { SubscriptionSchema } from '../subscription/schema/subscription.schema';
import { ServiceModule } from '../service/service.module';
import { SMSModule } from 'src/config/sms/sms.module';
import { NotificationModule } from '../notification/notification.module';
import { TestimonialModule } from '../testimonial/testimonial.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EVENT_CATEGORY_COLLECTION, schema: EventCategorySchema },
      { name: EVENT_COLLECTION, schema: EventSchema },
      { name: EVENT_REGIST_COLLECTION, schema: EventRegistrationSchema },
      { name: SUBSCRIPTION_COLLECTION, schema: SubscriptionSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    }),
    SMSModule,
    SESModule,
    S3Module,
    ServiceModule,
    NotificationModule,
    TestimonialModule,
  ],
  controllers: [
    EventCategoryController,
    EventController,
    EventRegistrationController,
  ],
  providers: [EventCategoryService, EventService, EventRegistrationService],
  exports: [EventService, EventRegistrationService],
})
export class EventModule {}
