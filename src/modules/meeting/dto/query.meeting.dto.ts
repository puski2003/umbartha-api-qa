import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class MeetingParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;
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
}

export class MeetingNotificationParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly notificationId: string;
}

export class MeetingDurationParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly durationId: string;
}

export class MeetingScheduleParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly scheduleId: string;
}

export class MeetingDataFormParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly dataFormId: string;
}

export class MeetingOptionParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly optionId: string;
}
