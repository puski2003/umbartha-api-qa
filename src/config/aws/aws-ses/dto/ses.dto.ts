import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendEmailDto {
  @IsArray({ each: true })
  @IsOptional()
  readonly ccAddresses: string[];

  @IsNotEmpty()
  @IsArray()
  readonly toAddresses: string[];

  @IsNotEmpty()
  @IsString()
  readonly htmlData: string;

  @IsString()
  @IsOptional()
  readonly textData: string;

  @IsNotEmpty()
  @IsString()
  readonly subject: string;

  @IsNotEmpty()
  @IsString()
  readonly source: string;

  @IsArray({ each: true })
  @IsOptional()
  readonly replyToAddresses: string[];
}

export class SendEmailTemplateDto {
  @IsNotEmpty()
  @IsString()
  readonly templateName: string;

  @IsNotEmpty()
  @IsString()
  readonly source: string;

  @IsNotEmpty()
  @IsArray()
  readonly toAddresses: string[];

  @IsNotEmpty()
  @IsObject()
  readonly templateData: object;
}

export class VerifyEmail {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class CreateVerifyDto {
  @IsNotEmpty()
  @IsString()
  readonly templateName: string;

  @IsNotEmpty()
  @IsString()
  readonly subject: string;

  @IsOptional()
  @IsString()
  readonly template: string;
}

export class DeleteTemplateDto {
  @IsNotEmpty()
  @IsString()
  readonly templateName: string;
}
