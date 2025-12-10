import { Module } from '@nestjs/common';
import { PublicMeetingService } from './public-meeting.service';
import { PublicMeetingController } from './public-meeting.controller';
import { MeetingModule } from 'src/modules/meeting/meeting.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MEETING_COLLECTION } from 'src/modules/meeting/meeting.constants';
import { MeetingSchema } from 'src/modules/meeting/schemas/meeting.schema';
import { MeetingBookingModule } from 'src/modules/meeting.booking/meeting.booking.module';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';
import { ClientModule } from 'src/modules/client/client.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MEETING_COLLECTION, schema: MeetingSchema },
    ]),
    MeetingModule,
    ClientModule,
    MeetingBookingModule,
    BookingPaymentModule,
  ],
  controllers: [PublicMeetingController],
  providers: [PublicMeetingService],
})
export class PublicMeetingModule {}
