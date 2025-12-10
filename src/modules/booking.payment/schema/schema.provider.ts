import { Connection } from 'mongoose';
import {
  BOOKING_PAYMENT_COLLECTION,
  BOOKING_PAYMENT_MODEL,
} from '../booking.payment.constants';
import { BookingPaymentSchema } from './booking.payment.schema';

export const BookingPaymentSchemaProvider = [
  {
    provide: BOOKING_PAYMENT_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(BOOKING_PAYMENT_COLLECTION, BookingPaymentSchema);
    },
  },
];
