import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Range, ReservationTypes } from '../schema/location.reservation.schema';

export class CreateReservation {
  @IsNotEmpty()
  @IsEnum(ReservationTypes)
  readonly reserveType: string;

  @IsNotEmpty()
  @IsEnum(Range)
  readonly rangeFrom: string;

  @IsNotEmpty()
  @IsEnum(Range)
  readonly rangeTo: string;

  @IsNotEmpty()
  @IsDateString()
  readonly reserveFrom: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly reserveTo: Date;

  @IsOptional()
  @IsMongoId()
  readonly counsellor: string;

  @IsNotEmpty()
  @IsString()
  readonly location: string;
}

export class CreateForDayReservationDto {
  @IsNotEmpty()
  @IsDateString()
  readonly reserveFrom: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly reserveTo: Date;

  @IsOptional()
  @IsMongoId()
  readonly counsellor: string;

  @IsNotEmpty()
  @IsString()
  readonly location: string;
}
