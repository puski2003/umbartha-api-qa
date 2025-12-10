import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class RateParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly rate: string;
}

export class RateQueryDto {
  @IsOptional()
  @IsString()
  _search: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number;
}
