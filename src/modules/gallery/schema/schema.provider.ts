import { Connection } from 'mongoose';
import { Gallery_COLLECTION, Gallery_MODEL } from '../gallery.constants';
import { GallerySchema } from './gallery.schema';

export const ServiceSchemaProvider = [
  {
    provide: Gallery_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(Gallery_COLLECTION, GallerySchema);
    },
  },
];
