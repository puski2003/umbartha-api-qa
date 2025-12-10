import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { S3Module } from 'src/config/aws/aws-s3/module';

@Module({
  imports: [S3Module],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [],
})
export class ImageModule {}
