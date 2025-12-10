import { Module } from '@nestjs/common';
import { PublicSubscriptionService } from './public-subscription.service';
import { PublicSubscriptionController } from './public-subscription.controller';
import { SubscriptionModule } from 'src/modules/subscription/subscription.module';

@Module({
  imports: [SubscriptionModule],
  providers: [PublicSubscriptionService],
  controllers: [PublicSubscriptionController],
})
export class PublicSubscriptionModule {}
