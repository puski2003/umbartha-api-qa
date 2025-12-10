import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  readonly _id: string;

  @Prop({ type: Object })
  readonly counsellor: object;

  @Prop({ type: Object })
  readonly client: object;

  @Prop(Date)
  readonly bookingDate: Date;

  @Prop()
  readonly location: string;

  @Prop(Date)
  readonly lastSendDailyReminderTime: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
