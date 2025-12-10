import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Status {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedOn' } })
export class Subscription {
  readonly _id: string;

  @Prop({ index: true })
  readonly email: string;

  @Prop()
  readonly type: string;

  @Prop()
  readonly updatedBy: string;

  @Prop({ enum: Status, index: true })
  readonly status: Status;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
