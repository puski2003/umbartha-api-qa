import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EVENT_CATEGORY_COLLECTION } from '../event.constants';

export enum EventType {
  Service = 'SERVICE',
}

export enum TypeOfEventLocation {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

@Schema({ timestamps: true })
export class Event extends Document {
  _id: string;

  @Prop({
    type: Types.ObjectId,
    ref: EVENT_CATEGORY_COLLECTION,
  })
  readonly category: string;

  @Prop({ enum: EventType })
  readonly type: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly title: string;

  @Prop()
  readonly description: string;

  @Prop()
  readonly specialInstruction: string;

  @Prop({ types: { dateFrom: { type: Date }, dateTo: { type: Date } } })
  dates: {
    dateFrom: Date;
    dateTo: Date;
  }[];

  @Prop({ types: { from: { type: Date }, to: { type: Date } } })
  readonly timings: {
    readonly from: Date;
    readonly to: Date;
  }[];

  @Prop({
    type: {
      eventType: { type: String },
      name: { type: String },
      link: { type: String },
    },
  })
  readonly location: {
    readonly eventType: TypeOfEventLocation;
    readonly name: string;
    readonly link: string;
  };

  @Prop({
    name: { type: String },
    designation: { type: String },
    link: { type: String },
  })
  readonly speakers: {
    readonly name: string;
    readonly designation: string;
    readonly link: string;
  }[];

  @Prop({
    _id: { type: new Types.ObjectId() },
    url: { type: String },
    fileName: { type: String },
    featured: { type: Boolean, default: false },
    uri: { type: String },
  })
  readonly gallery: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly featured: boolean;
    readonly uri: string;
  }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
