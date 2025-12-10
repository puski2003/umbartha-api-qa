import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GalleryVisibility } from '../schema/gallery.schema';

export class CreateGalleryDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsMongoId()
  readonly event: string;

  @IsNotEmpty()
  @IsEnum(GalleryVisibility)
  readonly visibility: string;
}
