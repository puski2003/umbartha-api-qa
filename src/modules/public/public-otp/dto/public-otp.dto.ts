import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class OTPSendDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  readonly phone: string;
}

export class OTPVerifyDto {
  @IsNotEmpty()
  @IsNumber()
  readonly otp: number;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;
}
