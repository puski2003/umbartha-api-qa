import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  Gender,
  SessionType,
  Status,
  Title,
} from '../schemas/counsellor.schema';
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

export class CreateCounselorDto {
  @IsString()
  @IsOptional()
  readonly userId: string;

  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  readonly index: number;

  @IsNotEmpty()
  @IsEnum(Title)
  readonly title: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  readonly gender: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber()
  readonly hotline: string;

  @IsNotEmpty()
  @IsMobilePhone()
  readonly mobile: string;

  @IsOptional()
  @IsDateString()
  readonly dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsOptional()
  @IsDateString()
  readonly practiceStartedOn: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsArray()
  @IsOptional()
  readonly languagesSpoken: string[];

  @IsOptional()
  @IsEnum(SessionType, { each: true })
  @IsArray()
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

export class UploadProfilePicture {
  @IsNotEmpty()
  @IsUrl()
  readonly profilePictureURL: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  readonly profilePicture: ProfilePicture;
}

export class ChangeStatusDto {
  @IsEnum(Status)
  readonly status: Status;
}
