import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ScheduleParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly scheduleId: string;
}

export class ScheduleQueryDto {
  @IsOptional()
  @IsString()
  _search: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsOptional()
  @Type(() => Date)
  readonly startTime: Date;

  @IsOptional()
  @Type(() => Date)
  readonly endTime: Date;
}
