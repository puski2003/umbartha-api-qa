import { IsNotEmpty, IsString } from 'class-validator';

export class ImageQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly mimetype: string;
}
