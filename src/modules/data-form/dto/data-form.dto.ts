import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TargetAudience } from '../schemas/data-form.schema';

export class DataFormParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly dataFormId: string;
}

export class RemoveDataParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly dataFormId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly dataId: string;
}

class Options {
  @IsNotEmpty()
  @IsString()
  readonly value: string;

  @IsNotEmpty()
  @IsString()
  readonly display: string;

  @IsArray()
  @IsOptional()
  readonly target?: string[];
}

class Condition {
  @IsNotEmpty()
  @IsString()
  readonly showIf: string;
}

export class CreateData {
  _id: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsOptional()
  readonly placeHolder?: string;

  @IsString()
  @IsOptional()
  readonly section?: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsObject({ each: true })
  @Type(() => Condition)
  @IsOptional()
  readonly condition?: Condition;

  @IsString()
  @IsOptional()
  readonly label?: string;

  @IsString()
  @IsOptional()
  readonly displayName?: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly required: boolean;

  @IsString()
  @IsOptional()
  readonly validationTemplate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Options)
  @IsOptional()
  readonly options?: Options[];
}

export class CreateDataFormDto {
  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  readonly counsellor: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDataFormDto)
  @IsOptional()
  readonly data?: CreateDataFormDto;

  @IsNotEmpty()
  @IsEnum(TargetAudience)
  readonly target: string;
}

export class UpdateDataFormDto extends PartialType(CreateDataFormDto) {}

export class UpdateData extends PartialType(CreateData) {}
