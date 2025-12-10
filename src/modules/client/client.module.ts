import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from './schemas/client.schema';
import { CLIENT_COLLECTION } from './client.constants';
import { JwtModule } from '@nestjs/jwt';
import { DataFormModule } from '../data-form/data-form.module';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from '../meeting.booking/schema/meeting.booking.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CLIENT_COLLECTION, schema: ClientSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    }),
    DataFormModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
