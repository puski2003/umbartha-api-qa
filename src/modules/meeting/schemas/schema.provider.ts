import { Connection } from 'mongoose';
import { MEETING_BOOKING_COLLECTION } from 'src/modules/meeting.booking/meeting.booking.constants';
import { MeetingSchema } from './meeting.schema';
import { MEETING_MODEL } from '../meeting.constants';

export const MeetingSchemaProvider = [
  {
    provide: MEETING_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(MEETING_BOOKING_COLLECTION, MeetingSchema);
    },
  },
];
