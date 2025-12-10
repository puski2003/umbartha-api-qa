import { Module } from '@nestjs/common';
import { PublicClientController } from './public-client.controller';
import { PublicClientService } from './public-client.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from 'src/modules/client/schemas/client.schema';
import { SESModule } from 'src/config/aws/aws-ses/module';
import { ClientModule } from 'src/modules/client/client.module';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import { MeetingBookingModule } from 'src/modules/meeting.booking/meeting.booking.module';
import { COUNSELLOR_RATE_COLLECTION } from 'src/modules/counsellor.rate/counsellor.rate.constants';
import { CounsellorRateSchema } from 'src/modules/counsellor.rate/schema/counsellor.rate.schema';
import { BookingPaymentModule } from 'src/modules/booking.payment/booking.payment.module';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPaymentSchema } from 'src/modules/booking.payment/schema/booking.payment.schema';
import {
  DataForm,
  DataFormSchema,
} from 'src/modules/data-form/schemas/data-form.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CLIENT_COLLECTION,
        schema: ClientSchema,
      },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
      { name: BOOKING_PAYMENT_COLLECTION, schema: BookingPaymentSchema },
      { name: COUNSELLOR_RATE_COLLECTION, schema: CounsellorRateSchema },
      { name: DataForm.name, schema: DataFormSchema },
    ]),
    ClientModule,
    SESModule,
  ],
  controllers: [PublicClientController],
  providers: [PublicClientService],
})
export class PublicClientModule {}
