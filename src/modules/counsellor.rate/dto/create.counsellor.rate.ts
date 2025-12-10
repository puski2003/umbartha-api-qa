import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRateDto {
  @IsNotEmpty()
  @IsNumber()
  readonly hourFrom: number;

  @IsNotEmpty()
  @IsNumber()
  readonly hourTo: number;

  @IsNotEmpty()
  @IsNumber()
  readonly rate: number;

  @IsNotEmpty()
  @IsString()
  readonly currency: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  readonly nationality: string;

  @IsOptional()
  @IsMongoId()
  readonly counsellor: string;

  @IsOptional()
  @IsMongoId()
  readonly service: string;

  @IsBoolean()
  @IsOptional()
  readonly defaultRate: boolean;
}
