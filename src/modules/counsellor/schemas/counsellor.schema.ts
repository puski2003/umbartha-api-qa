import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Service } from 'src/modules/service/schema/service.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

export enum Title {
  Mr = 'Mr',
  Ms = 'Ms',
  Mrs = 'Mrs',
  Dr = 'Dr',
  Prof = 'Prof',
  Rev = 'Rev',
  Hon = 'Hon',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum SessionType {
  ONLINE = 'ONLINE',
  ON_PREMISE = 'ON-PREMISE',
}

export enum Status {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Counsellor extends Document {
  readonly _id: string;

  @Prop({ index: true })
  readonly userId: string;

  @Prop()
  readonly index: number;

  @Prop()
  readonly title: Title;

  @Prop()
  readonly profilePictureURL: string;

  @Prop()
  readonly gender: Gender;

  @Prop()
  readonly firstName: string;

  @Prop()
  readonly lastName: string;

  @Prop()
  readonly displayName: string;

  @Prop()
  readonly email: string;

  @Prop()
  readonly hotline: string;

  @Prop()
  readonly mobile: string;

  @Prop()
  readonly dateOfBirth: string;

  @Prop()
  readonly country: string;

  @Prop()
  readonly practiceStartedOn: string;

  @Prop()
  readonly description: string;

  @Prop([String])
  readonly languagesSpoken: string[];

  @Prop({ type: [] })
  readonly sessionType: SessionType[];

  @Prop({ type: [Types.ObjectId], ref: SERVICE_COLLECTION })
  readonly services: Service[];

  @Prop({ type: [String] })
  readonly specialization: string[];

  @Prop({ type: [String] })
  readonly credentials: string[];

  @Prop({
    type: [
      {
        licenseType: { type: String },
        licenseNumber: { type: String },
        licenseExpirationDate: { type: String },
      },
    ],
  })
  licenses: {
    licenseType: string;
    licenseNumber: string;
    licenseExpirationDate: string;
  }[];

  @Prop({
    type: {
      name: String,
      s3ObjectURL: String,
      uri: String,
    },
  })
  readonly profilePicture: {
    _id: string;
    name: string;
    s3ObjectURL: string;
    readonly uri: string;
  };

  @Prop()
  readonly createdBy: string;

  @Prop({ default: 'DRAFT' })
  readonly status: Status;

  @Prop({ default: false })
  readonly publishAppointments: boolean;

  @Prop({ default: false })
  readonly publishCalendar: boolean;
}

export const CounsellorSchema = SchemaFactory.createForClass(Counsellor);
