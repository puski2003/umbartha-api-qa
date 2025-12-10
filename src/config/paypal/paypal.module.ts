import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { WebhookModule } from './webhook/webhook.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [AuthenticationModule, WebhookModule, OrderModule],
})
export class PaypalModule {}
