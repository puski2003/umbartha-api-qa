import {
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class TestimonialParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly testimonialId: string;
}

export class PhotoParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly testimonialId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly photoId: string;
}

export class GallerQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}
