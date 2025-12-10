import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SERVICE_COLLECTION } from '../service.constants';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop()
  readonly name: string;

  @Prop()
  readonly title: string;

  @Prop()
  readonly subTitle: string;

  @Prop()
  readonly description: string;

  @Prop()
  readonly subDescription: string;

  @Prop()
  readonly specialInstruction: string;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly groupService: string;

  @Prop({
    url: { type: String },
    fileName: { type: String },
    uri: { type: String },
  })
  readonly mainImage: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly uri: string;
  }[];

  @Prop({
    url: { type: String },
    fileName: { type: String },
    uri: { type: String },
  })
  readonly mainGallery: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly uri: string;
  }[];

  @Prop({
    url: { type: String },
    fileName: { type: String },
    uri: { type: String },
  })
  readonly subGallery: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly uri: string;
  }[];

  @Prop()
  readonly createdBy: string;

  @Prop()
  readonly publishInServicePage: boolean;

  @Prop({ default: false })
  readonly enableBooking: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
