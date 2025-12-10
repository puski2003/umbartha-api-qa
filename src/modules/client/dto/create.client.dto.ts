import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateIntakeForm {
  @IsNotEmpty()
  @IsString()
  readonly form: string;

  @IsNotEmpty()
  readonly formData: any;
}

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly age: number;

  @IsOptional()
  @IsArray()
  @Type(() => CreateIntakeForm)
  @ValidateNested({ each: true })
  readonly intakeForm: CreateIntakeForm[];

  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsOptional()
  @IsString()
  readonly comment: string;
}

export class CLientPhoneVerificationDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  readonly referenceId: string;
}

export class EmailVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
