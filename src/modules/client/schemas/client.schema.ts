import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DataForm } from 'src/modules/data-form/schemas/data-form.schema';

export enum ClientExsisted {
  NEW = 'NEW',
  EXSISTED = 'EXSISTED',
}

@Schema({ timestamps: true })
export class Client extends Document {
  readonly _id: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly age: number;

  @Prop({ index: true })
  readonly phone: string;

  @Prop({ default: false })
  readonly phoneVerified: boolean;

  @Prop({ index: true })
  readonly email: string;

  @Prop()
  readonly secondaryName: string;

  @Prop()
  readonly secondaryEmail: string;

  @Prop({ default: false })
  readonly emailVerified: boolean;

  @Prop()
  readonly country: string;

  @Prop()
  readonly nationality: string;

  @Prop()
  readonly comment: string;

  @Prop({
    type: [
      {
        date: { type: Date },
        form: { type: Types.ObjectId, ref: DataForm.name },
        formData: {},
      },
    ],
  })
  readonly intakeForm: {
    readonly date: Date;
    readonly form: string;
    readonly formData: any;
  }[];

  @Prop({ enum: ClientExsisted, default: ClientExsisted.NEW })
  readonly exsisted: string;

  @Prop({ default: false })
  readonly existed: boolean;

  @Prop({
    _id: false,
    type: {
      email: { type: Boolean },
      sms: { type: Boolean },
    },
  })
  readonly notificationType: {
    readonly email: boolean;
    readonly sms: boolean;
  };

  @Prop(Date)
  readonly createdAt: Date;

  @Prop(Date)
  readonly updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
