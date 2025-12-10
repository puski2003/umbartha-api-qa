import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CerateFaqDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsNumber()
  readonly order: number;
}
