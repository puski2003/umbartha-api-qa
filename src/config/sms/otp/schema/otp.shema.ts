import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OtpStatus {
  CREATED = 'CREATED',
  SEND = 'SEND',
  ENTERED = 'ENTERED',
  FAIL = 'FAIL',
}

@Schema({ timestamps: true })
export class Otp extends Document {
  readonly _id: string;

  @Prop({
    default: () => {
      const digits = '123456789';
      let OTP = '';
      for (let i = 0; i < 5; i++)
        OTP += digits[Math.floor(Math.random() * digits.length)];

      return Number(OTP);
    },
  })
  readonly otp: number;

  @Prop({ default: OtpStatus.CREATED })
  readonly status: string;

  @Prop({ default: 300 })
  readonly validSeconds: number;

  @Prop({ default: 1 })
  readonly attempts: number;

  @Prop()
  readonly phone: string;

  @Prop()
  readonly email: string;

  @Prop(Date)
  readonly createdAt: Date;

  @Prop(Date)
  readonly updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
