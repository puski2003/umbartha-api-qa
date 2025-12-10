import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  isEmpty,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MeetingType } from 'src/modules/meeting/schemas/meeting.schema';

export class BankDetailsDto {
  @IsNotEmpty()
  @IsString()
  readonly accountHolderName: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  readonly accountHolderPhone: string;

  @IsNotEmpty()
  @IsString()
  readonly accountNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly bankName: string;

  @IsNotEmpty()
  @IsString()
  readonly branchName: string;
}

export class PayPalDto {
  @IsOptional()
  @ValidateIf(
    (obj: PayPalDto) => isEmpty(obj.email) && isEmpty(obj.paymentLink),
  )
  @IsNotEmpty()
  @IsString()
  readonly accountId: string;

  @IsOptional()
  @ValidateIf(
    (obj: PayPalDto) => isEmpty(obj.accountId) && isEmpty(obj.paymentLink),
  )
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @ValidateIf((obj: PayPalDto) => isEmpty(obj.accountId) && isEmpty(obj.email))
  @IsNotEmpty()
  @IsUrl()
  readonly paymentLink: string;
}

export class CreatePaymentOptionDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsBoolean()
  readonly enabled: boolean;

  @IsNotEmpty()
  @IsEnum(MeetingType)
  readonly meetingType: string;

  @IsOptional()
  @IsMongoId()
  readonly counsellor: string;

  @IsOptional()
  @IsMongoId()
  readonly service: string;

  @IsOptional()
  @IsMongoId()
  readonly template: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsDto)
  readonly bankDetails: BankDetailsDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PayPalDto)
  readonly payPal: PayPalDto;

  @IsOptional()
  @IsString()
  readonly otherOptions: string;
}
