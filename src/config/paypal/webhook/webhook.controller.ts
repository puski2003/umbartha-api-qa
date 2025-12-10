import { Controller, Post, Req, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request, Response } from 'express';

@Controller('paypal/webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('listener')
  async webhookListener(@Req() req: Request, @Res() res: Response) {
    this.webhookService.webhookListener(req);
    res.sendStatus(200);
  }
}
