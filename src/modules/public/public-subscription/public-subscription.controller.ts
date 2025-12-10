import { Body, Controller, Post } from '@nestjs/common';
import { PublicSubscriptionService } from './public-subscription.service';
import { CreateSubscriptionDto } from 'src/modules/subscription/dto/create.subscription.dto';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';

@Controller('public/subscription')
export class PublicSubscriptionController {
  constructor(
    private readonly publicSubscriptionService: PublicSubscriptionService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('subscribe')
  async createSubscription(
    @Body() query: reCaptchaResponse,
    @Body() subscription: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscribe(query, subscription);
  }
}
