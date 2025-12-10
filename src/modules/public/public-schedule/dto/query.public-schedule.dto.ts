import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MeetingBookingType } from 'src/modules/meeting.booking/schema/meeting.booking.schema';

export class BookingQueryDto {
  @IsOptional()
  @IsString()
  readonly counsellor: string;

  @IsOptional()
  @IsString()
  readonly startDate: string;

  @IsOptional()
  @IsDateString()
  readonly startTime: Date;

  @IsOptional()
  @IsString()
  readonly meetingType: string;
}

export class ScheduleParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly schedule: string;
}

export class PaypalOrderCaptureDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly schedule: string;

  @IsNotEmpty()
  @IsString()
  readonly order: string;
}

export class MeetingTypeQuery {
  @IsNotEmpty()
  @IsEnum(MeetingBookingType)
  readonly meetingBookingType: string;

  @IsNotEmpty()
  @IsString()
  readonly timezone: string;
}
