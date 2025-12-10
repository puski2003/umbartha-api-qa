import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GalleryParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly galleryId: string;
}

export class PhotoParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly galleryId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly imageId: string;
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
