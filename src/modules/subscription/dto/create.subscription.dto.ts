import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly type: string;

  @IsOptional()
  @IsString()
  readonly timeZone: string;
}
