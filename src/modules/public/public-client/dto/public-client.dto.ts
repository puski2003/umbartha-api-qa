import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPhoneNumber,
  IsMongoId,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class ClientParams {
  @IsString()
  @IsMongoId()
  readonly clientId: string;
}

export class ExsistedClientParams {
  @IsOptional()
  @IsPhoneNumber()
  readonly phone: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;
}

export class CreateClientDto {
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

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  readonly nationality: string;

  @IsOptional()
  @IsString()
  readonly comment: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly meetingBooking: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly counsellor: string;
}
