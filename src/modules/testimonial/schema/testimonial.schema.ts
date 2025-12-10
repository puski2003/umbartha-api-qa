import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EVENT_COLLECTION } from 'src/modules/event/event.constants';
import { Event } from 'src/modules/event/schema/event.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

export enum TestimonialType {
  HomePage = 'HOMEPAGE',
  Service = 'SERVICE',
  Event = 'EVENT',
}

@Schema({ timestamps: true })
export class TestimonialPhoto extends Document {
  readonly _id: string;

  @Prop()
  readonly url: string;

  @Prop()
  readonly fileName: string;

  @Prop()
  readonly uri: string;

  @Prop({ type: Date, default: new Date() })
  readonly uploadDate: Date;
}

const TestimonialPhotoSchema = SchemaFactory.createForClass(TestimonialPhoto);

@Schema({ timestamps: { createdAt: 'createdDate' } })
export class Testimonial extends Document {
  readonly _id: string;

  @Prop({ enum: TestimonialType })
  readonly type: string;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly _serviceId: string;

  @Prop({ type: Types.ObjectId, ref: EVENT_COLLECTION })
  readonly event: Event;

  @Prop()
  readonly name: string;

  @Prop()
  readonly title: string;

  @Prop()
  readonly testimonial: string;

  @Prop({ type: TestimonialPhotoSchema })
  readonly photo: TestimonialPhoto;

  @Prop(Date)
  readonly createdDate: Date;

  @Prop(Date)
  readonly updatedAt: Date;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
