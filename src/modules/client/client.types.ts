export interface ClientI {
  _id: string;
  name: string;
  intakeForm: object;
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  country: string;
  comment: string;
}

export interface CreateClientI {
  name: string;
  age: number;
  intakeForm?: object;
  phone: string;
  email: string;
  country: string;
  comment: string;
}

export interface UpdateClientI {
  name: string;
  age: number;
  intakeForm: object;
  phone: string;
  email: string;
  country: string;
  comment: string;
}

export interface CreateIntakeFormI {
  form: string;
  formData: any;
}

export interface emailVerifyI {
  token: string;
  expires: string;
}
