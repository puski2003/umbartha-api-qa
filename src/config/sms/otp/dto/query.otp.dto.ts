import {
  IsEmail,
  isEmpty,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class Phone {
  @IsOptional()
  @IsMobilePhone()
  readonly phone: string;

  @ValidateIf((obj) => isEmpty(obj.phone))
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
