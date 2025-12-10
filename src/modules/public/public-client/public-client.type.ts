export interface ExsistedClientI {
  readonly phone: string;
  readonly email: string;
}

export interface CreateClientI {
  readonly name: string;
  readonly age: number;
  readonly phone: string;
  readonly email: string;
  readonly country: string;
  readonly nationality: string;
  readonly comment: string;
  readonly counsellor: string;
  readonly meetingBooking: string;
}

export interface CreateIntakeFormI {
  form: string;
  formData: any;
}
