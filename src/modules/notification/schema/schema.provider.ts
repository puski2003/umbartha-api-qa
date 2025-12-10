import { Connection } from 'mongoose';
import {
  NOTIFICATION_COLLECTION,
  NOTIFICATION_MODEL,
} from '../../notification/notification.constants';
import { NotificationSchema } from './notification.schema';

export const TemplateSchemaProvider = [
  {
    provide: NOTIFICATION_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(NOTIFICATION_COLLECTION, NotificationSchema);
    },
  },
];
