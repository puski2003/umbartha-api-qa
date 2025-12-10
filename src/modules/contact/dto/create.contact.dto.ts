import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsPhoneNumber(null, { message: 'phone number must be a valid phone number' })
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
