import { Connection } from 'mongoose';
import {
  PAYIT_FORWARD_COLLECTION,
  PAYIT_FORWARD_MODEL,
} from '../payit-forward.constants';
import { PayitForwardSchema } from './payit-forward.schema';

export const PayitForwardSchemaProvider = [
  {
    provide: PAYIT_FORWARD_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(PAYIT_FORWARD_COLLECTION, PayitForwardSchema);
    },
  },
];
