import { IsOptional, IsString } from 'class-validator';

export class reCaptchaResponse {
  @IsOptional()
  @IsString()
  readonly response: string;

  @IsOptional()
  @IsString()
  readonly remoteip: string;
}
