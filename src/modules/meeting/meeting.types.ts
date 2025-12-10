export interface MeetingI {
  readonly meetingType: string;
  readonly organizer: string;
  readonly internalName: string;
  readonly description: string;
  readonly scheduling: {
    readonly title: string;
    readonly description: string;
    readonly enablePayments: boolean;
    readonly timezone: string;
    readonly notifications: {
      readonly type: string;
      readonly enable: boolean;
      readonly template: string;
      readonly remark: string;
      readonly sendBefore: number;
    }[];
  };
}

export interface CreateMeetingI {
  readonly meetingType: string;
  readonly organizer: string;
  readonly internalName: string;
  readonly description: string;
  readonly scheduling: {
    readonly title: string;
    readonly description: string;
    readonly enablePayments: boolean;
    readonly timezone: string;
  };
}

export interface UpdateMeetingI {
  readonly meetingType: string;
  readonly internalName: string;
  readonly description: string;
  readonly scheduling: {
    readonly title: string;
    readonly description: string;
    readonly enablePayments: boolean;
    readonly timezone: string;
  };
}

export class AddMeetingNotificationi {
  readonly type: string;
  readonly enable: boolean;
  readonly template: string;
  readonly remark: string;
  readonly sendBefore: number;
}

export class AdddurationOptionI {
  readonly hours: number;
  readonly mins: number;
}

export class AddScheduleI {
  readonly type: string;
  readonly meetingLink: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly schedule: {
    readonly rangeFrom: string;
    readonly rangeTo: string;
    readonly startTime: Date;
    readonly endTime: Date;
    readonly room: string[];
  };
}

export class AddDataFormI {
  order: number;
  readonly allowSkip: boolean;
}

export class OverrideI {
  additionalInfo: string;
}
