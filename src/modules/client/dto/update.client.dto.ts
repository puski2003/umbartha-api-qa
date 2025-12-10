import { CreateClientDto, CreateIntakeForm } from './create.client.dto';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClientDto extends CreateClientDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsNumber()
  readonly age: number;

  @IsOptional()
  @IsArray()
  @Type(() => CreateIntakeForm)
  @ValidateNested({ each: true })
  readonly intakeForm: CreateIntakeForm[];

  @IsOptional()
  @IsPhoneNumber()
  readonly phone: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly country: string;

  @IsOptional()
  @IsString()
  readonly comment: string;
}
