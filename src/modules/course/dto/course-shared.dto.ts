import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ResourceDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsOptional()
  type: string;
}

export class VideoDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  videoUrl: string;

  @IsString()
  @IsOptional()
  duration: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  @IsOptional()
  resources: ResourceDto[];
}

export class ModuleDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  @IsOptional()
  videos: VideoDto[];
}

export class TestimonialDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
