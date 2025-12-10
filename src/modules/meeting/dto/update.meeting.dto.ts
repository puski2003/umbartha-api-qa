import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MeetingType } from '../schemas/meeting.schema';
import { Type } from 'class-transformer';

export class Scheduling {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsBoolean()
  readonly enablePayments: boolean;

  @IsOptional()
  @IsString()
  readonly timezone: string;
}

export class UpdateMeetingDto {
  @IsOptional()
  @IsEnum(MeetingType)
  readonly meetingType: string;

  @IsOptional()
  @IsString()
  readonly internalName: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Scheduling)
  readonly scheduling: Scheduling;

  @IsOptional()
  @IsString()
  readonly specialInstruction: string;

  @IsOptional()
  @IsString()
  readonly cancellationPolicy: string;
}

export class DeleteAllSchedules {
  @IsOptional()
  @IsDateString()
  readonly startTime: Date;

  @IsOptional()
  @IsDateString()
  readonly endTime: Date;
}
