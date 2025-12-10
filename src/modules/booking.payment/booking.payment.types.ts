export interface InstallmentI {
  installmentPayment: number;
  readonly paidOn: Date;
  readonly paymentMethod: string;
  readonly coupon: string;
}

export interface BookingPaymentI {
  readonly client: string;
  readonly counsellor: string;
  readonly meeting: string;
  readonly room: string;
  readonly completed: boolean;
  readonly currency: string;
  readonly paymentOption: string;
  readonly amount: number;
  readonly paid: number;
  readonly installments: InstallmentI;
}

export interface CreateBookingPayementI {
  readonly client: string;
  readonly counsellor: string;
  readonly meeting: any;
  readonly room: any;
  readonly currency: string;
  readonly paymentOption: string;
  readonly amount: number;
}

export interface BookingPaymentQueryI {
  readonly client?: string;
  readonly counsellor?: string;
  readonly status: string;
  readonly dateFrom: Date;
  readonly dateTo: Date;
}
