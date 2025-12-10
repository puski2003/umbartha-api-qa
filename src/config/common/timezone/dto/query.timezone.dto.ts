import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GPSCoordinateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly lat: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly lon: number;
}
