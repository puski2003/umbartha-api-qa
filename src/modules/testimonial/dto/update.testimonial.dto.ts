import { IsOptional, IsString } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly testimonial: string;
}
 