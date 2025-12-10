import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  isNotEmpty,
} from 'class-validator';
import { MeetingBookingStatus } from '../schema/meeting.booking.schema';

export class MeetingBookingParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingBookingId: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @IsString()
  readonly status: MeetingBookingStatus;

  @IsOptional()
  @IsString()
  @ValidateIf((obj) => isNotEmpty(obj.dateFrom) || isNotEmpty(obj.dateTo))
  @IsEmpty()
  readonly date: string;

  @IsOptional()
  @IsDateString()
  readonly dateFrom: Date;

  @IsOptional()
  @IsDateString()
  readonly dateTo: Date;
}
