import { Connection } from 'mongoose';
import {
  COUNSELLOR_RATE_COLLECTION,
  COUNSELLOR_RATE_MODEL,
} from '../counsellor.rate.constants';
import { CounsellorRateSchema } from './counsellor.rate.schema';

export const CounsellorRateSchemaProvider = [
  {
    provide: COUNSELLOR_RATE_MODEL,
    inject: ['Umbartha'],
    userFactory: (connection: Connection) => {
      return connection.model(COUNSELLOR_RATE_COLLECTION, CounsellorRateSchema);
    },
  },
];
