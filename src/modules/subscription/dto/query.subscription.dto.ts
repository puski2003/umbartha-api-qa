import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Status } from '../schema/subscription.schema';

export class SubscriptionParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly subscriptionId: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  readonly _search: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @IsString()
  readonly status: Status;
}
