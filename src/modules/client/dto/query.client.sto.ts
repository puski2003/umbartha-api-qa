import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
} from 'class-validator';

export class ClientParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly clientId: string;
}

export class ClientPhoneParam {
  @IsOptional()
  @IsPhoneNumber()
  readonly phone: string;
}

export class ClientIntakeFormParam {
  @IsNotEmpty()
  @IsMongoId()
  readonly clientId: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly dataFormId: string;
}

export class EmailVerifyDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly expires: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  readonly page: number;
}
