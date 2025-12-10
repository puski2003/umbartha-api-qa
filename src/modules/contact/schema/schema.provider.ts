import { Connection } from 'mongoose';
import { CONTACT_COLLECTION, CONTACT_MODEL } from '../contact.contancts';
import { ContactSchema } from './contact.schema';

export const ContactSchemaProvider = [
  {
    provide: CONTACT_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(CONTACT_COLLECTION, ContactSchema);
    },
  },
];
