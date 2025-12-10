import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPayment } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import { Client } from 'src/modules/client/schemas/client.schema';
import { COUNSELLOR_RATE_COLLECTION } from 'src/modules/counsellor.rate/counsellor.rate.constants';
import { CounsellorRate } from 'src/modules/counsellor.rate/schema/counsellor.rate.schema';
import { Counsellor } from 'src/modules/counsellor/schemas/counsellor.schema';
import { LOCATION_COLLECTION } from 'src/modules/location/location.constants';
import { Location } from 'src/modules/location/schemas/location.schema';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { MeetingBooking } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { MEETING_COLLECTION } from 'src/modules/meeting/meeting.constants';
import {
  Meeting,
  MeetingType,
} from 'src/modules/meeting/schemas/meeting.schema';
import { Service } from 'src/modules/service/schema/service.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

export enum ScheduleTypes {
  DAY = 'DAY',
  DAY_MON = 'DAY-MON',
  DAY_TUE = 'DAY-TUE',
  DAY_WED = 'DAY-WED',
  DAY_THU = 'DAY-THU',
  DAY_FRI = 'DAY-FRI',
  DAY_SAT = 'DAY-SAT',
  DAY_SUN = 'DAY-SUN',
  RANGE = 'RANGE',
  EVERYDAY = 'EVERYDAY',
}

export enum Range {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

@Schema({ timestamps: true })
export class Schedule extends Document {
  readonly _id: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Counsellor',
    index: true,
  })
  readonly counsellor: Counsellor;

  @Prop({
    type: Types.ObjectId,
    ref: MEETING_COLLECTION,
    index: true,
  })
  readonly meeting: Meeting;

  @Prop({ enum: MeetingType })
  readonly meetingType: MeetingType;

  @Prop()
  readonly meetingLink: string;

  @Prop({ enum: ScheduleTypes })
  readonly scheduleType: ScheduleTypes;

  @Prop({ enum: Range })
  readonly rangeFrom: Range;

  @Prop({ enum: Range })
  readonly rangeTo: Range;

  @Prop({ type: Date, index: true })
  readonly startTime: Date;

  @Prop({ type: Date, index: true })
  readonly endTime: Date;

  @Prop({ type: [Types.ObjectId], ref: LOCATION_COLLECTION })
  readonly room: Location[];

  @Prop({
    type: Types.ObjectId,
    ref: COUNSELLOR_RATE_COLLECTION,
  })
  readonly rate: CounsellorRate;

  @Prop({ index: true, default: false })
  readonly booked: boolean;

  @Prop({ type: Date, default: new Date() })
  readonly expiresIn: Date;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly service: Service;

  @Prop({ type: Types.ObjectId, ref: MEETING_BOOKING_COLLECTION })
  readonly meetingBooking: MeetingBooking;

  @Prop({ type: Types.ObjectId, ref: BOOKING_PAYMENT_COLLECTION })
  readonly bookingPayment: BookingPayment;

  @Prop({ type: Types.ObjectId, ref: CLIENT_COLLECTION })
  readonly client: Client;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
