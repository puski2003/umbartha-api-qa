import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EVENT_COLLECTION } from 'src/modules/event/event.constants';

export enum GalleryVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Schema({ timestamps: { createdAt: 'createdDate' } })
export class Gallery extends Document {
  readonly _id: string;

  @Prop()
  readonly title: string;

  @Prop()
  readonly description: string;

  @Prop({
    type: Types.ObjectId,
    ref: EVENT_COLLECTION,
    index: true,
  })
  readonly event: string;

  @Prop()
  readonly updatedBy: string;

  @Prop({ enum: GalleryVisibility })
  readonly visibility: GalleryVisibility;

  @Prop({
    type: { _id: Types.ObjectId, url: String, fileName: String, uri: String },
  })
  readonly image: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly uri: string;
  };
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
