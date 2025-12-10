import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSchema } from './schemas/location.schema';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { LOCATION_COLLECTION } from './location.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LOCATION_COLLECTION, schema: LocationSchema },
    ]),
    S3Module,
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
