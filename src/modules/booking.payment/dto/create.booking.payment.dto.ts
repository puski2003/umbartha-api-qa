import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingPaymentDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly client: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly counsellor: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly meeting: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly room: string;

  @IsNotEmpty()
  @IsString()
  readonly currency: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly paymentOption: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}

export class AddingInstallmentDto {
  @IsNotEmpty()
  @IsNumber()
  readonly installmentPayment: number;

  @IsNotEmpty()
  @IsDateString()
  readonly paidOn: Date;

  @IsNotEmpty()
  @IsMongoId()
  readonly paymentMethod: string;

  @IsOptional()
  @IsString()
  readonly coupon: string;
}

export class AddingCouponDto {
  @IsNotEmpty()
  @IsString()
  readonly coupon: string;
}
