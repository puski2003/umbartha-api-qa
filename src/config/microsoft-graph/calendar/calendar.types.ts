export interface CalendarEventI {
  subject: string;
  start: {
    dateTime: Date;
    timeZone: string;
  };
  end: {
    dateTime: Date;
    timeZone: string;
  };
  showAs: string;
  location: {
    displayName: string;
  };
  attendees: {
    type: string;
    emailAddress: {
      name: string;
      address: string;
    };
  }[];
}
