import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { GalleryVisibility } from '../schema/gallery.schema';

export class UpdateGalleryDto {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsMongoId()
  readonly event: string;

  @IsOptional()
  @IsEnum(GalleryVisibility)
  readonly visibility: string;
}
