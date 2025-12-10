export interface PayitForwardI {
  readonly _id: string;
  readonly _serviceId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email: string;
  readonly attachment: {
    readonly _id: string;
    readonly url: string;
    readonly fileName: string;
  }[];
  readonly comment: string;
}

export interface CreatePayitForwardI {
  readonly _serviceId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email: string;
  readonly comment: string;
}
