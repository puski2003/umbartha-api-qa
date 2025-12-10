import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery_COLLECTION } from './gallery.constants';
import { GallerySchema } from './schema/gallery.schema';
import { EventModule } from '../event/event.module';
import { S3Module } from 'src/config/aws/aws-s3/module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gallery_COLLECTION, schema: GallerySchema },
    ]),
    EventModule,
    S3Module,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
