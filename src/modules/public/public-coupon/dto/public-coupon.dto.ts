import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CouponGetParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly bookingPayment: string;

  @IsNotEmpty()
  @IsString()
  readonly couponName: string;
}
