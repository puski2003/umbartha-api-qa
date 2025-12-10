import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from './schema/subscription.schema';
import { SUBSCRIPTION_COLLECTION } from './subscription.constants';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { ReCaptchaModule } from 'src/config/re-captcha/re-captcha.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SUBSCRIPTION_COLLECTION,
        schema: SubscriptionSchema,
      },
    ]),
    NotificationModule,
    SESModule,
    ReCaptchaModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
