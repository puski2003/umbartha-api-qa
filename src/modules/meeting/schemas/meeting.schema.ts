import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Counsellor } from 'src/modules/counsellor/schemas/counsellor.schema';
import { DataForm } from 'src/modules/data-form/schemas/data-form.schema';
import { SCHEDULE_COLLECTION } from 'src/modules/schedule/schedule.constants';
import { PAYMENT_OPTION_COLLECTION } from 'src/modules/payment.option/payment.option.constants';
import { NOTIFICATION_TEMPLATE_COLLECTION } from 'src/modules/notification.template/notification.template.constants';

export enum MeetingType {
  ONLINE = 'ONLINE',
  ON_PREMISE = 'ON-PREMISE',
  BOTH = 'BOTH',
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum ScheduleTypes {
  DAY = 'DAY',
  DAY_MON = 'DAY-MON',
  DAY_TUE = 'DAY-TUE',
  DAY_WED = 'DAY-WED',
  DAY_THU = 'DAY-THU',
  DAY_FRI = 'DAY-FRI',
  DAY_SAT = 'DAY-SAT',
  DAY_SUN = 'DAY-SUN',
  RANGE = 'RANGE',
  EVERYDAY = 'EVERYDAY',
}

export enum Range {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

@Schema({ timestamps: true })
export class Meeting extends Document {
  @Prop()
  meetingType: MeetingType;

  @Prop({
    type: Types.ObjectId,
    ref: Counsellor.name,
    required: true,
  })
  organizer: string;

  @Prop()
  internalName: string;

  @Prop()
  description: string;

  @Prop()
  specialInstruction: string;

  @Prop()
  cancellationPolicy: string;

  @Prop({
    type: {
      title: { type: String },
      description: { type: String },
      enablePayments: { type: Boolean },
      timezone: { type: String },
      notifications: {
        type: [
          {
            type: { type: String },
            enable: { type: Boolean },
            template: {
              type: Types.ObjectId,
              ref: NOTIFICATION_TEMPLATE_COLLECTION,
              required: true,
            },
            remark: { type: String },
            sendBefore: { type: Number },
          },
        ],
      },
      durationOptions: {
        type: [
          {
            hours: { type: Number },
            mins: { type: Number },
            display: { type: String },
          },
        ],
      },
      schedule: {
        _id: false,
        type: [Types.ObjectId],
        ref: SCHEDULE_COLLECTION,
      },
    },
  })
  scheduling: {
    title: string;
    description: string;
    enablePayments: boolean;
    timezone: string;
    notifications: {
      type: NotificationType;
      enable: boolean;
      template: string;
      remark: string;
      sendBefore: number;
    }[];
    durationOptions: { hours: number; mins: number; display: string }[];
    schedule: string[];
  };

  @Prop({
    type: {
      available: { type: [Types.ObjectId], ref: PAYMENT_OPTION_COLLECTION },
      overrides: {
        type: [
          {
            _id: { type: Types.ObjectId },
            name: { type: String },
            enable: { type: Boolean },
            description: { type: String },
            additionalInfo: { type: String },
            template: { type: String },
            bankDetails: { type: Object },
            paypal: { type: Object },
            meetingType: { type: String },
          },
        ],
      },
    },
  })
  payment: {
    available: string[];
    overrides: {
      _id: string;
      name: string;
      enable: boolean;
      description: string;
      additionalInfo: string;
      template: string;
      bankDetails: object;
      paypal: object;
      meetingType: string;
    }[];
  };

  @Prop({
    type: {
      linkedForms: {
        type: [
          {
            form: { type: Types.ObjectId, ref: DataForm.name },
            order: { type: Number },
            allowSkip: { type: Boolean },
          },
        ],
      },
    },
  })
  forms: {
    linkedForms: {
      form: string;
      order: number;
      allowSkip: boolean;
    }[];
  };

  @Prop()
  ownedBy: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
