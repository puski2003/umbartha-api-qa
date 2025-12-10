import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
  isNotEmpty,
} from 'class-validator';
import {
  MeetingType,
  NotificationType,
  Range,
  ScheduleTypes,
} from '../schemas/meeting.schema';
import { Type } from 'class-transformer';

export class Scheduling {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly enablePayments: boolean;

  @IsNotEmpty()
  @IsString()
  readonly timezone: string;
}

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsEnum(MeetingType)
  readonly meetingType: string;

  @IsOptional()
  @IsString()
  readonly organizer: string;

  @IsNotEmpty()
  @IsString()
  readonly internalName: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly specialInstruction: string;

  @IsOptional()
  @IsString()
  readonly cancellationPolicy: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Scheduling)
  readonly scheduling: Scheduling;
}

export class CreateMeetingNotificationDto {
  @IsOptional()
  @IsEnum(NotificationType)
  readonly type: string;

  @IsOptional()
  @IsBoolean()
  readonly enable: boolean;

  @IsOptional()
  @IsMongoId()
  readonly template: string;

  @IsOptional()
  @IsString()
  readonly remark: string;

  @IsOptional()
  @IsNumber()
  readonly sendBefore: number;
}

export class CreatedurationOptionDto {
  @IsNotEmpty()
  @IsNumber()
  readonly hours: number;

  @IsNotEmpty()
  @IsNumber()
  readonly mins: number;
}

export class CreateScheduleDto {
  @IsOptional()
  @IsEnum(Range)
  readonly rangeFrom: string;

  @IsOptional()
  @IsEnum(Range)
  readonly rangeTo: string;

  @IsNotEmpty()
  @IsDateString()
  readonly startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly endTime: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly room: string[];
}

export class CreateScheduleRequestDto {
  @IsNotEmpty()
  @IsEnum(ScheduleTypes)
  readonly type: string;

  @IsOptional()
  @IsUrl()
  readonly meetingLink: string;

  @IsNotEmpty()
  @IsDateString()
  readonly startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly endDate: Date;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  readonly schedule: CreateScheduleDto;
}

export class CreateDataFormDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly form: string;

  @ValidateIf((obj) => isNotEmpty(obj.order))
  @IsNumber()
  @IsPositive()
  readonly order: number;

  @IsNotEmpty()
  @IsBoolean()
  readonly allowSkip: boolean;
}

export class CreateOverrideDto {
  @IsOptional()
  @IsString()
  readonly additionalInfo: string;
}
