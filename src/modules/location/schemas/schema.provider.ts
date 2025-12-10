import { Connection } from 'mongoose';
import { LOCATION_COLLECTION, LOCATION_MODEL } from '../location.constants';
import { LocationSchema } from './location.schema';

export const LocationSchemaProvider = [
  {
    provide: LOCATION_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(LOCATION_COLLECTION, LocationSchema);
    },
  },
];
