import { IsNotEmpty, IsMongoId, IsEmail, IsString } from 'class-validator';

export class MeetingParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly meetingId: string;
}

export class ClientPhoneParams {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class GetPaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  readonly meetingType: string;
}
