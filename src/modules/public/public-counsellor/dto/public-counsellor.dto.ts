import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CounsellorQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  readonly publishAppointments: boolean;
}

export class CounsellorGetParam {
  @IsNotEmpty()
  @IsString()
  readonly counsellorId: string;
}
