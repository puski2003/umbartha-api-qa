import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  PaginationQueryDto,
  SubscriptionParams,
} from './dto/query.subscription.dto';
import { CreateSubscriptionDto } from './dto/create.subscription.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';
import { ChangeStatusDto } from './dto/update.subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Auth('jar')
  @Get()
  async getAllSubscription(
    @Query() { _search, limit, page, status }: PaginationQueryDto,
  ) {
    return await this.subscriptionService.findAllSubscription(
      _search,
      limit,
      page,
      status,
    );
  }

  @Auth('jar')
  @Get(':subscriptionId')
  async getSubscription(@Param() params: SubscriptionParams) {
    return await this.subscriptionService.findSelectedSubscription(
      params.subscriptionId,
    );
  }

  @Auth('jar')
  @Post()
  async createSubscription(
    @Body() query: reCaptchaResponse,
    @Body() subscription: CreateSubscriptionDto,
  ) {
    return await this.subscriptionService.createSubscribe(query, subscription);
  }

  @Auth('jar')
  @Delete(':subscriptionId')
  async deleteSubscription(@Param() params: SubscriptionParams) {
    return await this.subscriptionService.deleteSelectedSubscription(
      params.subscriptionId,
    );
  }

  @Auth('jar')
  @Patch(':subscriptionId')
  async updateSubscription(
    @User() user: User,
    @Param() params: SubscriptionParams,
    @Body() subscription: ChangeStatusDto,
  ) {
    return await this.subscriptionService.changeStatus(
      user,
      params.subscriptionId,
      subscription.timeZone,
    );
  }
}
