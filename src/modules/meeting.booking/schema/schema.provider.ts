import { Connection } from 'mongoose';
import {
  MEETING_BOOKING_COLLECTION,
  MEETING_BOOKING_MODEL,
} from '../meeting.booking.constants';
import { MeetingBookingSchema } from './meeting.booking.schema';

export const MeetingBookingSchemaProvider = [
  {
    provide: MEETING_BOOKING_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(MEETING_BOOKING_COLLECTION, MeetingBookingSchema);
    },
  },
];
