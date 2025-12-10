import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { DateRangeFilter } from '../schema/event-registration.schema';

export class EventRegistrationParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly registrationId: string;
}

export class CreateEventRegistrationDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly _eventId: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly timeZone: string;
}

export class UpdateRegisteredEventDto {
  @IsOptional()
  @IsPhoneNumber()
  readonly phone: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;
}

export class PhoneVerificationDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;
}

export class PhoneVerifyDto {
  @IsNotEmpty()
  @IsNumber()
  readonly otp: number;

  @IsNotEmpty()
  @Type(() => CreateEventRegistrationDto)
  readonly registation: CreateEventRegistrationDto;
}

export class EmailVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class EmailVerifyDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly expires: string;
}

export class EventRegistrationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @IsString()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly lastName: string;

  @IsOptional()
  @IsString()
  readonly eventTitle: string;

  @IsOptional()
  @IsString()
  readonly serviceName: string;

  @IsOptional()
  @IsEnum(DateRangeFilter)
  readonly date: string;

  @IsOptional()
  @Type(() => Date)
  readonly dateFrom: Date;

  @IsOptional()
  @Type(() => Date)
  readonly dateTo: Date;
}
