import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COUPON_COLLECTION } from 'src/modules/coupon/coupon.constants';
import { CLIENT_COLLECTION } from 'src/modules/client/client.constants';
import { COUNSELLOR_COLLECTION } from 'src/modules/counsellor/counsellor.constants';
import { MEETING_COLLECTION } from 'src/modules/meeting/meeting.constants';
import { LOCATION_COLLECTION } from 'src/modules/location/location.constants';
import { PAYMENT_OPTION_COLLECTION } from 'src/modules/payment.option/payment.option.constants';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { MeetingBooking } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { PaymentOption } from 'src/modules/payment.option/schemas/payment.option.schema';

export enum PaypalStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
}

export enum BookingPaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

export enum PaypalOrderStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Paypal extends Document {
  readonly _id: string;

  @Prop()
  readonly orderId: string;

  @Prop()
  readonly intent: string;

  @Prop({ enum: PaypalOrderStatus })
  readonly status: string;

  @Prop()
  readonly amount: string;

  @Prop()
  readonly currency: string;

  @Prop({
    _id: false,
    type: {
      name: { type: String },
      email: { type: String },
      payerId: { type: String },
      country: { type: String },
    },
  })
  readonly payer: {
    readonly name: string;
    readonly email: string;
    readonly payerId: string;
    readonly country: string;
  };

  @Prop(Date)
  readonly createdAt: Date;

  @Prop(Date)
  readonly updatedAt: Date;
}

@Schema({ timestamps: true })
export class BookingPayment extends Document {
  readonly _id: string;

  @Prop({
    type: Types.ObjectId,
    ref: CLIENT_COLLECTION,
    required: true,
  })
  readonly client: string;

  @Prop({
    type: Types.ObjectId,
    ref: COUNSELLOR_COLLECTION,
    required: true,
    index: true,
  })
  readonly counsellor: string;

  @Prop({ type: Types.ObjectId, ref: MEETING_COLLECTION, required: true })
  readonly meeting: string;

  @Prop({ type: Types.ObjectId, ref: LOCATION_COLLECTION })
  readonly room: string;

  @Prop({ type: Types.ObjectId, ref: MEETING_BOOKING_COLLECTION })
  readonly meetingBooking: MeetingBooking;

  @Prop({ default: false })
  readonly completed: boolean;

  @Prop({
    enum: Object.values(BookingPaymentStatus),
    default: BookingPaymentStatus.PENDING,
  })
  readonly status: string;

  @Prop()
  readonly currency: string;

  @Prop({ type: Types.ObjectId, ref: PAYMENT_OPTION_COLLECTION })
  readonly paymentOption: PaymentOption;

  @Prop()
  readonly amount: number;

  @Prop()
  readonly paid: number;

  @Prop({
    type: [
      {
        installmentPayment: { type: Number },
        paidOn: { type: Date, default: new Date() },
        paymentMethod: {
          type: Types.ObjectId,
          ref: PAYMENT_OPTION_COLLECTION,
        },
        coupon: { type: Types.ObjectId, ref: COUPON_COLLECTION },
      },
    ],
  })
  readonly installments: {
    readonly installmentPayment: number;
    readonly paidOn: Date;
    readonly paymentMethod: string;
    readonly coupon: string;
  }[];

  @Prop(Paypal)
  readonly paypal: Paypal;
}

export const BookingPaymentSchema =
  SchemaFactory.createForClass(BookingPayment);
