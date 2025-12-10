import { Connection } from 'mongoose';
import { SERVICE_COLLECTION, SERVICE_MODEL } from '../service.constants';
import { ServiceSchema } from './service.schema';

export const ServiceSchemaProvider = [
  {
    provide: SERVICE_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(SERVICE_COLLECTION, ServiceSchema);
    },
  },
];
