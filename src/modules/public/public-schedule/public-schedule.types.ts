export interface ScheduleQueryI {
  readonly counsellor: string;
  readonly startDate: string;
  readonly startTime: Date;
  readonly meetingType: string;
}

export interface AppointmentDetailsI {
  readonly name: string;
  readonly age: number;
  readonly phone: string;
  readonly email: string;
  readonly country: string;
  readonly nationality: string;
  readonly comment: string;
  readonly service: string;
  readonly secondaryName: string;
  readonly secondaryEmail: string;
  readonly notificationType: {
    readonly email: boolean;
    readonly sms: boolean;
  };
}
