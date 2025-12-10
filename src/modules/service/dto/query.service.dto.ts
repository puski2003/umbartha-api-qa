import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ServiceParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly serviceId: string;
}

export class ChildServiceParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly serviceId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly groupServiceId: string;
}

export class ServiceQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  readonly enableBooking: boolean;
}

export class GallerParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly serviceId: string;

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
