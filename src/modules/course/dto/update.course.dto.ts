import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create.course.dto';
import { TestimonialDto } from './course-shared.dto';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
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
  testimonials?: any[];
}
