import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { TypeOfEventLocation } from '../schema/event.schema';
import { PartialType } from '@nestjs/mapped-types';

export class EventParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly eventId: string;
}

export class TimingsParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly eventId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly timingId: string;
}

export class SpeakersParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly eventId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly speakerId: string;
}

export class GalleryParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly eventId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly galleryId: string;
}

export class GallerQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}

export class CreateGalleryDto {
  @IsNotEmpty()
  @IsString()
  readonly url: string;

  @IsNotEmpty()
  @IsString()
  readonly fileName: string;

  @IsNotEmpty()
  @IsOptional()
  readonly featured: boolean;
}

export class CreateSpeakersDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly designation: string;

  @IsOptional()
  @IsUrl()
  readonly link: string;
}

export class CreateLocationDto {
  @IsNotEmpty()
  @IsEnum(TypeOfEventLocation)
  readonly eventType: string;

  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsUrl()
  readonly link: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

export class CreateTimingsDto {
  @IsNotEmpty()
  @IsDateString()
  readonly from: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly to: Date;
}

export class CreateDatesDto {
  @IsNotEmpty()
  @IsDateString()
  readonly dateFrom: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly dateTo: Date;
}

export class CreateEventDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly category: string;

  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDatesDto)
  readonly dates: CreateDatesDto[];

  // @IsArray()
  // @ArrayNotEmpty()
  // @ValidateNested({ each: true })
  // @Type(() => CreateTimingsDto)
  // readonly timings: CreateTimingsDto[];

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  readonly location: CreateLocationDto;

  // @IsArray()
  // @ArrayNotEmpty()
  // @ValidateNested({ each: true })
  // @Type(() => CreateSpeakersDto)
  // readonly speakers: CreateSpeakersDto[];

  // @IsArray()
  // @ArrayNotEmpty()
  // @ArrayMaxSize(1)
  // @ValidateNested({ each: true })
  // @Type(() => CreateGalleryDto)
  // readonly gallery: CreateGalleryDto[];
}

export class GalleryDto {
  @IsOptional()
  @Transform((object) => (object.value === 'true' ? true : false))
  @IsBoolean()
  readonly featured: boolean;
}

export class ImgaeDto {
  @IsNotEmpty()
  @IsString()
  readonly buckectName: string;

  @IsNotEmpty()
  @IsString()
  readonly folderName: string;
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
