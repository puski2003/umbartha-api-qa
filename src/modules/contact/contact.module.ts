import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactSchema } from './schema/contact.schema';
import { CONTACT_COLLECTION } from './contact.contancts';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { ReCaptchaModule } from 'src/config/re-captcha/re-captcha.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CONTACT_COLLECTION,
        schema: ContactSchema,
      },
    ]),
    SESModule,
    ReCaptchaModule,
    NotificationModule,
  ],
  providers: [ContactService],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}
