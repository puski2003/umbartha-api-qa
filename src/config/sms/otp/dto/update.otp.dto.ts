import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class OtpVarificationDto {
  @IsNotEmpty()
  @IsNumber()
  readonly otp: number;

  @IsOptional()
  @IsMobilePhone()
  readonly phone: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;
}
