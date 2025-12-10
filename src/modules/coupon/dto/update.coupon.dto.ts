import {
  IsEnum,
  IsOptional,
  ValidateIf,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { DiscountType } from '../schemas/coupon.schema';

export class UpdateCouponDto {
  @IsEnum(DiscountType)
  @IsOptional()
  readonly discountType: DiscountType;

  @ValidateIf((obj) => obj.discountType === 'PERCENT')
  @IsNumber()
  @IsOptional()
  readonly maxDiscount: number;

  @IsNumber()
  @IsOptional()
  readonly amount: number;

  @IsDateString()
  @IsOptional()
  readonly validThrough: Date;
}
