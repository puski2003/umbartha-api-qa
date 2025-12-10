import { Connection } from 'mongoose';
import {
  COUNSELLOR_COLLECTION,
  COUNSELLOR_MODEL,
} from '../counsellor.constants';
import { CounsellorSchema } from './counsellor.schema';

export const CounsellorRateSchemaProvider = [
  {
    provide: COUNSELLOR_MODEL,
    inject: ['Umbartha'],
    userFactory: (connection: Connection) => {
      return connection.model(COUNSELLOR_COLLECTION, CounsellorSchema);
    },
  },
];
