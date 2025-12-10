import { Module } from '@nestjs/common';
import { S3Service } from './service';
import { S3Controller } from './controller';

@Module({
  controllers: [S3Controller],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
