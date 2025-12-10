import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { BookingPaymentStatus } from '../schema/booking.payment.schema';

export enum Status {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export class BookingPaymentParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly bookingPaymentId: string;
}

export class BookingPaymentQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @IsEnum(Status)
  readonly status: Status;

  @IsOptional()
  @IsDateString()
  readonly dateFrom: Date;

  @IsOptional()
  @IsDateString()
  readonly dateTo: Date;
}

export class PaymentStatusDto {
  @IsNotEmpty()
  @IsEnum(BookingPaymentStatus)
  readonly status: string;
}
