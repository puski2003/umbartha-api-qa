import { Connection } from 'mongoose';
import { CLIENT_COLLECTION, CLIENT_MODEL } from '../client.constants';
import { ClientSchema } from './client.schema';

export const MeetingBookingSchemaProvider = [
  {
    provide: CLIENT_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(CLIENT_COLLECTION, ClientSchema);
    },
  },
];
