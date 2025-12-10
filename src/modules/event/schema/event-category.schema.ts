import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EventCategory extends Document {
  _id: Types.ObjectId;

  @Prop()
  readonly name: string;

  @Prop()
  readonly description: string;
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);
