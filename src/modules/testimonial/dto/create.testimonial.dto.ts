import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TestimonialType } from '../schema/testimonial.schema';

export class CreateTestimonialDto {
  @IsNotEmpty()
  @IsEnum(TestimonialType)
  readonly type: string;

  @ValidateIf((value) => value.type === TestimonialType.Service)
  @IsNotEmpty()
  @IsMongoId()
  readonly _serviceId: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly testimonial: string;

  @ValidateIf((value) => value.type === TestimonialType.Event)
  @IsNotEmpty()
  @IsMongoId()
  readonly event: string;
}
