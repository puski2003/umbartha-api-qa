import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
  IsMobilePhone,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { Title, SessionType } from '../schemas/counsellor.schema';
import { Type } from 'class-transformer';

export class Licenses {
  @IsNotEmpty()
  @IsString()
  readonly licenseType: string;

  @IsNotEmpty()
  @IsString()
  readonly licenseNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly licenseExpirationDate: string;
}

export class ProfilePicture {
  @IsString()
  readonly name: string;

  @IsUrl()
  readonly s3ObjectURL: string;
}

export class UpdateCounselorDto {
  @IsString()
  @IsOptional()
  readonly userId: string;

  @IsOptional()
  @Min(1)
  @IsNumber()
  readonly index: number;

  @IsOptional()
  @IsEnum(Title)
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly lastName: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber()
  readonly hotline: string;

  @IsOptional()
  @IsMobilePhone()
  readonly mobile: string;

  @IsOptional()
  @IsString()
  readonly country: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsArray()
  @IsOptional()
  readonly languagesSpoken: string[];

  @IsEnum(SessionType, { each: true })
  @IsArray()
  @IsOptional()
  readonly sessionType: string[];

  @IsArray()
  @IsOptional()
  readonly specialization: string[];

  @IsArray()
  @IsOptional()
  readonly credentials: string[];

  @IsArray()
  @Type(() => Licenses)
  @ValidateNested({ each: true })
  @IsOptional()
  readonly licenses: Licenses[];

  @IsOptional()
  @IsBoolean()
  readonly publishAppointments: boolean;

  @IsOptional()
  @IsBoolean()
  readonly publishCalendar: boolean;
}

export class CounsellorServiceDto {
  @IsNotEmpty()
  @IsMongoId({ each: true })
  readonly services: string[];
}
