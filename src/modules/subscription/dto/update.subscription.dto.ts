import { IsNotEmpty, IsEmail, IsOptional, IsString } from 'class-validator';

export class ChangeStatusDto {
  @IsOptional()
  @IsString()
  readonly timeZone: string;
}
