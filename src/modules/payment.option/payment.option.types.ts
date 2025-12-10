export interface PaymentOptionI {
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly counsellor: string;
  readonly service: string;
  readonly template: string;
  readonly bankDetails: {
    readonly accountHolderName: string;
    readonly accountHolderPhone: string;
    readonly accountNumber: string;
    readonly bankName: string;
    readonly branchName: string;
  };
  readonly payPal: {
    readonly accountID: string;
    readonly email: string;
    readonly paymentLink: string;
  };
}

export interface CreatePaymentOptionI {
  readonly name: string;
  readonly description: string;
}

export interface UpdatePaymentOptionI {
  readonly name?: string;
  readonly description?: string;
}
