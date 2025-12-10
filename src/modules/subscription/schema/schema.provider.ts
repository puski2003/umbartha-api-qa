import { Connection } from 'mongoose';
import {
  SUBSCRIPTION_COLLECTION,
  SUBSCRIPTION_MODEL,
} from '../subscription.constants';
import { SubscriptionSchema } from './subscription.schema';

export const SubscriptionSchemaProvider = [
  {
    provide: SUBSCRIPTION_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(SUBSCRIPTION_COLLECTION, SubscriptionSchema);
    },
  },
];
