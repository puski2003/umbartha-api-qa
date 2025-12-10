import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CouponParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly couponId: string;
}

export class CouponName {
  @IsNotEmpty()
  @IsString()
  readonly couponName: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;
}
