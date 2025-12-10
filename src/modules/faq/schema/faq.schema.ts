import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate' } })
export class FAQ extends Document {
  _id: Types.ObjectId;

  @Prop()
  readonly title: string;

  @Prop()
  readonly description: string;

  @Prop({ index: true })
  readonly order: number;

  @Prop()
  readonly createdBy: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);
