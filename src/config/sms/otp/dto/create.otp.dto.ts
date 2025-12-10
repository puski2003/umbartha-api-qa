import {
  IsEmail,
  IsMobilePhone,
  isEmpty,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateOtpDto {
  @IsOptional()
  @IsMobilePhone()
  readonly phone: string;

  @ValidateIf((obj) => isEmpty(obj.phone))
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
