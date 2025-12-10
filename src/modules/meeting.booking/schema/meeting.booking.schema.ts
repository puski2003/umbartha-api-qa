import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BOOKING_PAYMENT_COLLECTION } from 'src/modules/booking.payment/booking.payment.constants';
import { BookingPayment } from 'src/modules/booking.payment/schema/booking.payment.schema';
import { Client } from 'src/modules/client/schemas/client.schema';
import { Counsellor } from 'src/modules/counsellor/schemas/counsellor.schema';
import { LOCATION_COLLECTION } from 'src/modules/location/location.constants';
import { Location } from 'src/modules/location/schemas/location.schema';
import { Meeting } from 'src/modules/meeting/schemas/meeting.schema';
import { Service } from 'src/modules/service/schema/service.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

export enum MeetingBookingType {
  ONLINE = 'ONLINE',
  ON_PREMISE = 'ON-PREMISE',
}

export enum MeetingBookingStatus {
  PENDIND = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

@Schema({
  timestamps: true,
})
export class MeetingBooking extends Document {
  readonly _id: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', index: true })
  readonly client: Client;

  @Prop({
    type: Types.ObjectId,
    ref: 'Counsellor',
    index: true,
    required: true,
  })
  readonly counsellor: Counsellor;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly service: Service;

  @Prop({ type: Types.ObjectId, ref: 'Meeting', required: true })
  readonly meeting: Meeting;

  @Prop({ type: Types.ObjectId, ref: LOCATION_COLLECTION })
  readonly room: Location;

  @Prop({ type: Types.ObjectId, ref: BOOKING_PAYMENT_COLLECTION })
  readonly _bookingPaymentId: BookingPayment;

  @Prop({ type: Types.ObjectId, ref: BOOKING_PAYMENT_COLLECTION })
  readonly bookingPayment: string;

  @Prop(Date)
  readonly timeFrom: Date;

  @Prop(Date)
  readonly timeTo: Date;

  @Prop({ enum: MeetingBookingType })
  readonly meetingBookingType: string;

  @Prop({
    enum: MeetingBookingStatus,
    default: MeetingBookingStatus.PENDIND,
  })
  readonly status: MeetingBookingStatus;

  @Prop({
    type: [
      {
        createdAt: { type: Date },
        createdBy: { type: String },
        remark: { type: String },
      },
    ],
  })
  readonly remarks: {
    readonly createdAt: Date;
    readonly createdBy: string;
    readonly remark: string;
  }[];

  @Prop(Date)
  readonly nextRecommended: Date;

  @Prop()
  readonly timezone: string;

  @Prop()
  readonly calendarEventId: string;

  @Prop(Date)
  readonly createdAt: Date;

  @Prop(Date)
  readonly updatedAt: Date;
}

export const MeetingBookingSchema =
  SchemaFactory.createForClass(MeetingBooking);
