import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Grid {
  mainImage = 'mainImage',
  mainGallery = 'mainGallery',
  subGallery = 'subGallery',
}

export class CreateServiceDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly title: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly subTitle: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly subDescription: string;

  @IsOptional()
  @IsBoolean()
  readonly publishInServicePage: boolean;

  @IsOptional()
  @IsString()
  readonly specialInstruction: string;

  @IsOptional()
  @IsMongoId()
  readonly groupService: string;

  @IsOptional()
  @IsBoolean()
  readonly enableBooking: boolean;
}

export class ServiceGalleryDto {
  @ApiProperty({
    type: String,
    enum: Grid,
  })
  @IsNotEmpty()
  @IsEnum(Grid)
  readonly gridName: string;
}
