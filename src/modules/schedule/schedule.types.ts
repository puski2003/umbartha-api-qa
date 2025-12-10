export interface ScheduleI {
  _id: any;
  counsellor: any;
  meeting: any;
  meetingType: string;
  meetingLink: string;
  scheduleType: string;
  rangeFrom: string;
  rangeTo: string;
  startTime: Date;
  endTime: Date;
  room: string[];
}
