import { Connection } from 'mongoose';
import {
  TESTIMONIAL_COLLECTION,
  TESTIMONIAL_MODEL,
} from '../testimonial.constants';
import { TestimonialSchema } from './testimonial.schema';

export const TestimonialSchemaProvider = [
  {
    provide: TESTIMONIAL_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(TESTIMONIAL_COLLECTION, TestimonialSchema);
    },
  },
];
