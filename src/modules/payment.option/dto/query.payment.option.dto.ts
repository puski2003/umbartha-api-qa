import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class PaymentOptionParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly paymentOption: string;
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

  @IsOptional()
  readonly meetingType: string;

  @IsOptional()
  readonly counsellor: string;
}
