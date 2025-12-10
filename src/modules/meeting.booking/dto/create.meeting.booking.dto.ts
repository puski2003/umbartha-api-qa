import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsMongoId,
  IsDate,
} from 'class-validator';
import { MeetingBookingStatus } from '../schema/meeting.booking.schema';

export class CreateMeetingBookingDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly client: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly counsellor: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly meeting: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly room: string;

  @IsNotEmpty()
  readonly timeFrom: Date;

  @IsNotEmpty()
  readonly timeTo: Date;
}
