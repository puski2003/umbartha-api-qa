import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class ContactParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly requestId: string;
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
