import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Type } from '../schemas/location.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly meetingRoom: boolean;
}

export class UploadGalleryDto {
  @IsString()
  @IsNotEmpty()
  readonly public: string;
}

export class CreateClosedDatePlaneDto {
  @IsNotEmpty()
  @IsEnum(Type)
  readonly type: Type;

  @IsNotEmpty()
  @IsString()
  readonly valueFrom: string;

  @IsNotEmpty()
  @IsString()
  readonly valueTo: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
