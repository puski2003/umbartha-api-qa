import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class TestimonialParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly templateId: string;
}

export class TemplateQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}
