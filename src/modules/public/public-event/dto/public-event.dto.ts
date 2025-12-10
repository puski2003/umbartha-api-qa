import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  readonly limit: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @IsString()
  readonly sort: string;
}
