import { IsMongoId, IsOptional } from 'class-validator';

export class ServiceParams {
  @IsOptional()
  @IsMongoId()
  readonly service: string;
}
