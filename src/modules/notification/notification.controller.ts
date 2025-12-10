import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send/daily-reminder')
  async sendDailyToCounsellor() {
    this.notificationService.counsellorDailyReminder();
    return;
  }

  @Post('send/client-reminder')
  async sendToClient() {
    this.notificationService.clientReminder();
    return;
  }

  @Post('send')
  async notificationSend(@Body() emailData: any) {
    return await this.notificationService.sendNotification(
      emailData.template,
      emailData.type,
      emailData.receiver,
      emailData.subject,
      emailData.data,
      emailData.sender,
    );
  }
}
