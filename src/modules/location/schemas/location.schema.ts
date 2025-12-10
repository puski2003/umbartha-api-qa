import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Type {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop()
  name: string;

  @Prop()
  meetingRoom: boolean;

  @Prop({
    type: [
      {
        url: { type: String },
        public: { type: Boolean },
        fileName: { type: String },
        uri: { type: String },
      },
    ],
  })
  gallery: {
    _id: string;
    url: string;
    public: string;
    fileName: string;
    readonly uri: string;
  }[];

  @Prop({
    type: [
      {
        type: { type: String },
        valueFrom: { type: String },
        valueTo: { type: String },
      },
    ],
  })
  closedDatePlan: {
    type: Type;
    valueFrom: string;
    valueTo: string;
  };

  @Prop()
  ceratedBy: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
