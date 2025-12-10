import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { SMSModule } from 'src/config/sms/sms.module';
import { NotificationTemplateModule } from '../notification.template/notification.template.module';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from '../meeting.booking/schema/meeting.booking.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';
import { CLIENT_COLLECTION } from '../client/client.constants';
import { ClientSchema } from '../client/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: CLIENT_COLLECTION, schema: ClientSchema },
    ]),
    NotificationTemplateModule,
    SESModule,
    SMSModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
