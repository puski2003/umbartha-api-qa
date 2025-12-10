import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ObjectDto {
  @IsNotEmpty()
  @IsString()
  readonly bucket: string;

  @IsNotEmpty()
  @IsString()
  readonly folderName: string;
}

export class BucketDto {
  @IsNotEmpty()
  @IsString()
  readonly bucketName: string;
}

class BucketPolicyStatement {
  @IsNotEmpty()
  @IsString()
  readonly Sid: string;

  @IsNotEmpty()
  @IsString()
  readonly Effect: string;

  @IsNotEmpty()
  readonly Principal: any;

  @IsNotEmpty()
  @IsString()
  readonly Action: string;

  @IsNotEmpty()
  @IsString()
  readonly Resource: string;
}

class BucketPolicy {
  @IsNotEmpty()
  @IsString()
  readonly Version: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BucketPolicyStatement)
  readonly Statement: BucketPolicyStatement[];
}

export class PolicyToBucketDto {
  @IsNotEmpty()
  @IsString()
  readonly bucketName: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => BucketPolicy)
  readonly policy: BucketPolicy;
}

export class ObjectFromBuckectDto {
  @IsNotEmpty()
  @IsString()
  readonly keyOfObj: string;
}
