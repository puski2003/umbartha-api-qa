import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT',
}

@Schema({ timestamps: true })
export class Coupon extends Document {
  _id: string;

  @Prop({ index: true, required: true })
  name: string;

  @Prop({ enum: DiscountType })
  discountType: DiscountType;

  @Prop()
  maxDiscount: number;

  @Prop()
  amount: number;

  @Prop(Date)
  validThrough: Date;

  @Prop(Date)
  usedOn: Date;

  @Prop()
  readonly ownedBy: string;

  @Prop()
  readonly createdBy: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
