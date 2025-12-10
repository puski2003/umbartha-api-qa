import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COUNSELLOR_COLLECTION } from 'src/modules/counsellor/counsellor.constants';

export enum TargetAudience {
  ALL = 'ALL',
  NEW = 'NEW',
  EXISTED = 'EXISTED',
}

@Schema({ timestamps: true })
export class DataForm extends Document {
  @Prop({ default: 'google-oauth2|112812097824744213415' })
  userId: string;

  @Prop()
  type: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: COUNSELLOR_COLLECTION, index: true })
  counsellor: string;

  @Prop({
    type: [
      {
        order: { type: Number },
        placeHolder: { type: String },
        section: { type: String },
        name: { type: String },
        type: { type: String },
        condition: {
          type: {
            showIf: { type: String },
          },
        },
        label: { type: String },
        displayName: { type: String },
        required: { type: Boolean },
        validationTemplate: { type: String },
        options: {
          type: [
            {
              value: { type: String },
              display: { type: String },
              target: { type: [String] },
            },
          ],
        },
      },
    ],
  })
  data: {
    order: number;
    placeHolder: string;
    section: string;
    name: string;
    type: string;
    condition: {
      type: {
        showIf: string;
      };
    };
    label: string;
    displayName: string;
    required: boolean;
    validationTemplate: string;
    options: {
      value: string;
      display: string;
      target: string[];
    }[];
  }[];

  @Prop({ enum: TargetAudience })
  readonly target: TargetAudience;

  @Prop()
  createdBy: string;
}

export const DataFormSchema = SchemaFactory.createForClass(DataForm);
