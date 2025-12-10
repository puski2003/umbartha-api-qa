import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ModuleDto, TestimonialDto } from './course-shared.dto';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsOptional()
  testimonials: any[];

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsOptional()
  modules: ModuleDto[];

  @IsOptional()
  price: number;

  @IsOptional()
  instructorId: string;

  @IsOptional()
  learningObjectives: string[] | string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  demoVideoUrl: string;

  @IsString()
  @IsOptional()
  demoVideoDuration: string;

  @IsOptional()
  showContentPreview: boolean;

  @IsOptional()
  videoMetadata: any;
}
