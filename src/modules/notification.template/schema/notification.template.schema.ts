import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationTemplateType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

@Schema()
export class NotificationTemplateFile extends Document {
  readonly _id: string;

  @Prop()
  readonly url: string;

  @Prop()
  readonly fileName: string;

  @Prop()
  readonly templateData: string;

  @Prop({ type: Date, default: new Date() })
  readonly uploadDate: Date;
}

@Schema({ timestamps: true })
export class NotificationTemplate extends Document {
  readonly _id: string;

  @Prop({ enum: NotificationTemplateType })
  readonly type: string;

  @Prop()
  readonly name: string;

  @Prop({ type: NotificationTemplateFile })
  readonly template: NotificationTemplateFile;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);
