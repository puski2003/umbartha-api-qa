import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description: string;
}

export class ChangeOrderDto {
  @IsNotEmpty()
  @IsNumber()
  readonly order: number;
}
