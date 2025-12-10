export interface ContactI {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
  readonly createdDate: Date;
  readonly acknowledged: boolean;
  readonly acknowledgedBy: string;
  readonly acknowledgedDate: Date;
}

export interface CreateContactI {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
}
