export interface EventRegistrationI {
  _eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CreateEventRegistrationI {
  _eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  timeZone: string;
}

export interface UpdateEventRegistrationI {
  email: string;
  phone: string;
}

export interface EmailVerifyI {
  token: string;
  expires: string;
}
