import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EVENT_COLLECTION } from '../event.constants';
import { Event } from './event.schema';

export enum DateRangeFilter {
  ALL = 'ALL',
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

@Schema({ timestamps: true })
export class EventRegistration extends Document {
  readonly _id: string;

  @Prop({
    type: Types.ObjectId,
    ref: EVENT_COLLECTION,
    required: true,
  })
  readonly _eventId: Event;

  @Prop()
  readonly firstName: string;

  @Prop()
  readonly lastName: string;

  @Prop()
  readonly email: string;

  @Prop()
  readonly emailVerified: boolean;

  @Prop()
  readonly phone: string;

  @Prop()
  readonly phoneVerified: boolean;
}

export const EventRegistrationSchema =
  SchemaFactory.createForClass(EventRegistration);
