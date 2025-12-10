import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class FAQParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly faqId: string;
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
