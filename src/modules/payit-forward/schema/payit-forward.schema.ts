import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

@Schema({ timestamps: true })
export class PayitForward extends Document {
  readonly _id: string;

  @Prop({ type: Types.ObjectId, ref: SERVICE_COLLECTION })
  readonly _serviceId: string;

  @Prop()
  readonly firstName: string;

  @Prop()
  readonly lastName: string;

  @Prop()
  readonly phone: string;

  @Prop()
  readonly email: string;

  @Prop({
    type: {
      url: String,
      fileName: String,
      mimetype: String,
    },
  })
  readonly attachment: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
    readonly mimetype: string;
  };

  @Prop({ default: false })
  readonly acknowledged: boolean;

  @Prop()
  readonly comment: string;
}

export const PayitForwardSchema = SchemaFactory.createForClass(PayitForward);
