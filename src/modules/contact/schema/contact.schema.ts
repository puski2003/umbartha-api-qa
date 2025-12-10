import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate' } })
export class Contact extends Document {
  _id: string;

  @Prop()
  readonly name: string;

  @Prop({ index: true })
  readonly email: string;

  @Prop({ index: true })
  readonly phone: string;

  @Prop()
  readonly message: string;

  @Prop({ type: Date, default: new Date() })
  readonly createdDate: Date;

  @Prop({ default: false })
  readonly acknowledged: boolean;

  @Prop()
  readonly acknowledgedBy: string;

  @Prop(Date)
  readonly acknowledgedDate: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
