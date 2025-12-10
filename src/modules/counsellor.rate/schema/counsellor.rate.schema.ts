import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Service } from 'src/modules/service/schema/service.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

@Schema({ timestamps: true })
export class CounsellorRate extends Document {
  readonly _id: string;

  @Prop()
  readonly hourFrom: number;

  @Prop()
  readonly hourTo: number;

  @Prop()
  readonly rate: number;

  @Prop()
  readonly currency: string;

  @Prop()
  readonly country: string;

  @Prop()
  readonly nationality: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Counsellor',
    index: true,
    required: true,
  })
  readonly counsellor: string;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly service: Service;

  @Prop({ index: true, default: false })
  readonly defaultRate: boolean;

  @Prop()
  readonly createdBy: string;
}

export const CounsellorRateSchema =
  SchemaFactory.createForClass(CounsellorRate);
