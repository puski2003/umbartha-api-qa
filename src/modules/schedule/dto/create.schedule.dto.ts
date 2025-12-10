import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { MeetingType, Range } from 'src/modules/meeting/schemas/meeting.schema';
import { ScheduleTypes } from '../schema/schedule.schema';

export class ScheduleDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly organizer: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly meeting: string;

  @IsNotEmpty()
  @IsEnum(MeetingType)
  readonly meetingType: string;

  @IsNotEmpty()
  @IsEnum(ScheduleTypes)
  readonly type: string;

  @ValidateIf((obj) => obj.type === 'RANGE')
  @IsNotEmpty()
  @IsEnum(Range)
  readonly rangeFrom: string;

  @ValidateIf((obj) => obj.type === 'RANGE')
  @IsNotEmpty()
  @IsEnum(Range)
  readonly rangeTo: string;

  @IsNotEmpty()
  @IsDateString()
  readonly startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly endTime: Date;

  @IsArray()
  @ArrayNotEmpty()
  readonly room: string[];

  @IsNotEmpty()
  @IsBoolean()
  readonly booked: boolean;
}
