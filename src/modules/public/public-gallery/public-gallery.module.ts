import { Module } from '@nestjs/common';
import { PublicGalleryController } from './public-gallery.controller';
import { PublicGalleryService } from './public-gallery.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Gallery_COLLECTION } from 'src/modules/gallery/gallery.constants';
import { GallerySchema } from 'src/modules/gallery/schema/gallery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gallery_COLLECTION, schema: GallerySchema },
    ]),
  ],
  controllers: [PublicGalleryController],
  providers: [PublicGalleryService],
})
export class PublicGalleryModule {}
