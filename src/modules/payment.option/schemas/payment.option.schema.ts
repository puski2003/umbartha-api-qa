import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COUNSELLOR_COLLECTION } from 'src/modules/counsellor/counsellor.constants';
import { MeetingType } from 'src/modules/meeting/schemas/meeting.schema';
import { NOTIFICATION_TEMPLATE_COLLECTION } from 'src/modules/notification.template/notification.template.constants';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

@Schema()
export class BankDetails extends Document {
  readonly _id: string;

  @Prop()
  readonly accountHolderName: string;

  @Prop()
  readonly accountNumber: string;

  @Prop()
  readonly bankName: string;

  @Prop()
  readonly branchName: string;

  @Prop()
  readonly accountHolderPhone: string;
}

@Schema()
export class PayPal extends Document {
  readonly _id: string;

  @Prop()
  readonly accountId: string;

  @Prop()
  readonly email: string;

  @Prop()
  readonly paymentLink: string;
}

@Schema({ timestamps: true })
export class PaymentOption extends Document {
  readonly _id: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly description: string;

  @Prop({ default: true })
  readonly enabled: boolean;

  @Prop({ enum: MeetingType })
  readonly meetingType: string;

  @Prop({ type: Types.ObjectId, ref: COUNSELLOR_COLLECTION })
  readonly counsellor: string;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly service: string;

  @Prop({ type: Types.ObjectId, ref: NOTIFICATION_TEMPLATE_COLLECTION })
  readonly template: string;

  @Prop({ type: BankDetails })
  readonly bankDetails: BankDetails;

  @Prop({ type: PayPal })
  readonly payPal: PayPal;

  @Prop()
  readonly otherOptions: string;

  @Prop()
  readonly userId: string;
}

export const PaymentOptionSchema = SchemaFactory.createForClass(PaymentOption);
