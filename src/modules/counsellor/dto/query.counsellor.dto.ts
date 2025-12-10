import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CounsellorQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  readonly publishAppointments: boolean;
}

export class CounsellorParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly counsellorId: string;
}

export class CounsellorServiceParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly counsellor: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly service: string;
}

export class ProfilePictureParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly counsellorId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly profilePictureId: string;
}

export class GallerQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}

export class CounsellorEmailParams {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
