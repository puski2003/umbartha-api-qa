import { Module } from '@nestjs/common';
import { NotificationTemplateController } from './notification.template.controller';
import { NotificationTemplateService } from './notification.template.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationTemplateSchema } from './schema/notification.template.schema';
import { NOTIFICATION_TEMPLATE_COLLECTION } from './notification.template.constants';
import { S3Module } from 'src/config/aws/aws-s3/module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NOTIFICATION_TEMPLATE_COLLECTION,
        schema: NotificationTemplateSchema,
      },
    ]),
    S3Module,
  ],
  controllers: [NotificationTemplateController],
  providers: [NotificationTemplateService],
  exports: [NotificationTemplateService],
})
export class NotificationTemplateModule {}
