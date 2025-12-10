import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class PayitForwardParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly payitForwardId: string;
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

export class AttachmentQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}
