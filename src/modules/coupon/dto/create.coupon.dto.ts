import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountType } from '../schemas/coupon.schema';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  readonly discountType: DiscountType;

  @ValidateIf((obj) => obj.discountType == 'PERCENT')
  @IsNotEmpty()
  @IsNumber()
  readonly maxDiscount: number;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  @IsDateString()
  readonly validThrough: Date;
}

export class RequestCouponDto {
  @IsNotEmpty()
  @IsPositive()
  readonly numberOfCoupons: number;

  @IsNotEmpty()
  @Type(() => CreateCouponDto)
  @ValidateNested({ each: true })
  readonly couponDetails: CreateCouponDto;

  @IsOptional()
  // @ValidateIf((obj) => isNotEmpty(obj.counsellor))
  @IsMongoId()
  readonly counsellor: string;
}
