import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COUNSELLOR_COLLECTION } from 'src/modules/counsellor/counsellor.constants';
import { Counsellor } from 'src/modules/counsellor/schemas/counsellor.schema';
import { LOCATION_COLLECTION } from 'src/modules/location/location.constants';

export enum ReservationTypes {
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
export class LocationReservation extends Document {
  readonly _id: string;

  @Prop({ enum: ReservationTypes })
  readonly reserveType: string;

  @Prop({ enum: Range })
  readonly rangeFrom: string;

  @Prop({ enum: Range })
  readonly rangeTo: string;

  @Prop({ type: Date, index: true })
  readonly reserveFrom: Date;

  @Prop({ type: Date, index: true })
  readonly reserveTo: Date;

  @Prop({ type: Types.ObjectId, ref: COUNSELLOR_COLLECTION, index: true })
  readonly counsellor: Counsellor;

  @Prop({ type: Types.ObjectId, ref: LOCATION_COLLECTION, index: true })
  readonly location: string;

  @Prop()
  readonly ownedBy: string;

  @Prop()
  readonly createdBy: string;
}

export const LocationReservationSchema =
  SchemaFactory.createForClass(LocationReservation);
