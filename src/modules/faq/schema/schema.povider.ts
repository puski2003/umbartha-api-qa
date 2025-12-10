import { Connection } from 'mongoose';
import { FAQ_COLLECTION, FAQ_MODEL } from '../faq.conatants';
import { FAQSchema } from './faq.schema';

export const FAQSchemaProvider = [
  {
    provide: FAQ_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(FAQ_COLLECTION, FAQSchema);
    },
  },
];
