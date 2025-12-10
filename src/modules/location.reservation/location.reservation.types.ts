import { Types } from 'mongoose';

export interface ReservationI {
  readonly reserveFrom: Date;
  readonly reserveTo: Date;
  readonly counsellor: Types.ObjectId;
  readonly location: Types.ObjectId;
  readonly ownedBy: string;
  readonly createdBy: string;
}

export interface CreateReservationI {
  readonly reserveType: string;
  readonly rangeFrom: string;
  readonly rangeTo: string;
  readonly reserveFrom: Date;
  readonly reserveTo: Date;
  readonly counsellor: string;
  readonly location: string;
}

export interface CreateForDayReservationI {
  readonly reserveFrom: Date;
  readonly reserveTo: Date;
  readonly counsellor: string;
  readonly location: string;
}

export interface UpdateReservationI {
  readonly reserveFrom: Date;
  readonly reserveTo: Date;
  readonly location: string;
}
