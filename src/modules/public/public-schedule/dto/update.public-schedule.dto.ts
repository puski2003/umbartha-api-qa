import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class NotificationTypeDto {
  @IsOptional()
  @IsBoolean()
  readonly email: boolean;

  @IsOptional()
  @IsBoolean()
  readonly sms: boolean;
}

export class AppointmentDetailsDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsNumber()
  readonly age: number;

  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly secondaryName: string;

  @IsOptional()
  @IsEmail()
  readonly secondaryEmail: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  readonly nationality: string;

  @IsOptional()
  @IsString()
  readonly comment: string;

  @IsOptional()
  @IsMongoId()
  readonly service: string;

  @IsOptional()
  @Type(() => NotificationTypeDto)
  readonly notificationType: NotificationTypeDto;
}
