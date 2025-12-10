import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingSchema } from './schemas/meeting.schema';
import {
  Counsellor,
  CounsellorSchema,
} from '../counsellor/schemas/counsellor.schema';
import { MeetingNotificationController } from './meeting-notification.controller';
import { MeetingNotificationService } from './meeting-notification.service';
import { MeetingDurationController } from './meeting-duration.controller';
import { MeetingDurationService } from './meeting-duration.service';
import { MeetingScheduleService } from './meeting-schedule.service';
import { MeetingScheduleController } from './meeting-schedule.controller';
import { MeetingPaymentController } from './meeting-payment.controller';
import { MeetingPaymentService } from './meeting-payment.service';
import { MEETING_COLLECTION } from './meeting.constants';
import { CounsellorRateSchema } from '../counsellor.rate/schema/counsellor.rate.schema';
import { COUNSELLOR_RATE_COLLECTION } from '../counsellor.rate/counsellor.rate.constants';
import { LocationModule } from '../location/location.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { LOCATION_RESERVATION_COLLECTION } from '../location.reservation/location.reservation.constants';
import { LocationReservationSchema } from '../location.reservation/schema/location.reservation.schema';
import { MeetingDataFormController } from './meeting-data-form.controller';
import { MeetingDataFormService } from './meeting-data-form.service';
import { DataFormModule } from '../data-form/data-form.module';
import { PaymentOptionModule } from '../payment.option/payment.option.module';
import {
  PaymentOption,
  PaymentOptionSchema,
} from '../payment.option/schemas/payment.option.schema';
import {ScheduleSchema } from '../schedule/schema/schedule.schema';
import {SCHEDULE_COLLECTION} from "../schedule/schedule.constants";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MEETING_COLLECTION, schema: MeetingSchema },
      { name: Counsellor.name, schema: CounsellorSchema },
      { name: COUNSELLOR_RATE_COLLECTION, schema: CounsellorRateSchema },
      { name: PaymentOption.name, schema: PaymentOptionSchema },
      {name: SCHEDULE_COLLECTION, schema: ScheduleSchema},
      {
        name: LOCATION_RESERVATION_COLLECTION,
        schema: LocationReservationSchema,
      },
    ]),
    ScheduleModule,
    LocationModule,
    PaymentOptionModule,
    DataFormModule,
  ],
  controllers: [
    MeetingDataFormController,
    MeetingPaymentController,
    MeetingScheduleController,
    MeetingDurationController,
    MeetingNotificationController,
    MeetingController,
  ],
  providers: [
    MeetingDataFormService,
    MeetingPaymentService,
    MeetingScheduleService,
    MeetingDurationService,
    MeetingNotificationService,
    MeetingService,
  ],
  exports: [MeetingService],
})
export class MeetingModule {}
