import { Connection } from 'mongoose';
import {
  LOCATION_RESERVATION_COLLECTION,
  LOCATION_RESERVATION_MODEL,
} from '../location.reservation.constants';
import { LocationReservationSchema } from './location.reservation.schema';

export const LocationReservationSchemaProvider = [
  {
    provide: LOCATION_RESERVATION_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(
        LOCATION_RESERVATION_COLLECTION,
        LocationReservationSchema,
      );
    },
  },
];
