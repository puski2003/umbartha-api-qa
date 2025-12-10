import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ReservationParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly reservationId: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  _search: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @Type(() => Date)
  readonly reserveFrom: Date;

  @IsOptional()
  @Type(() => Date)
  readonly reserveTo: Date;
}
