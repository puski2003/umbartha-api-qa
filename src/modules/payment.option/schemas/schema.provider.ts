import { Connection } from 'mongoose';
import {
  PAYMENT_OPTION_COLLECTION,
  PAYMENT_OPTION_MODEL,
} from '../payment.option.constants';
import { PaymentOptionSchema } from './payment.option.schema';

export const PaymentOptionSchemaProvider = [
  {
    provide: PAYMENT_OPTION_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(PAYMENT_OPTION_COLLECTION, PaymentOptionSchema);
    },
  },
];
