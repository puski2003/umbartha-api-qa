import { Module } from '@nestjs/common';
import { LocationReservationService } from './location.reservation.service';
import { LocationReservationController } from './location.reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LOCATION_RESERVATION_COLLECTION } from './location.reservation.constants';
import { LocationReservationSchema } from './schema/location.reservation.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LOCATION_RESERVATION_COLLECTION,
        schema: LocationReservationSchema,
      },
      {
        name: COUNSELLOR_COLLECTION,
        schema: CounsellorSchema,
      },
    ]),
    LocationModule,
  ],
  providers: [LocationReservationService],
  controllers: [LocationReservationController],
})
export class LocationReservationModule {}
