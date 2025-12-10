import { MeetingBookingStatus } from './schema/meeting.booking.schema';

export interface RemarkI {
  createdAt: Date;
  createdBy: string;
  remark: string;
}

export interface MeetingBookingI {
  client: string;
  counsellor: string;
  meeting: string;
  room: string;
  timeFrom: Date;
  timeTo: Date;
  status: MeetingBookingStatus;
  remarks: RemarkI;
  nextRecommended: Date;
}

export interface CreateMeetingBookingI {
  client: string;
  counsellor: string;
  meeting: string;
  room: string;
  timeFrom: Date;
  timeTo: Date;
}

export interface MeetingBookingQueryI {
  client?: string;
  counsellor?: string;
  status: string;
  date: string;
  dateFrom: Date;
  dateTo: Date;
}

export interface BookingInProcess {
  counsellor: string;
  meeting: string;
  room: string;
  timeFrom: Date;
  timeTo: Date;
}
