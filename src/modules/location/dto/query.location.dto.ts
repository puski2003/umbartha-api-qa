import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class LocationParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly locationId: string;
}

export class GalleryParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly locationId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly galleryId: string;
}

export class ClosedDatePlanParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly locationId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly closedDatePlanId: string;
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

export class GallerQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}
