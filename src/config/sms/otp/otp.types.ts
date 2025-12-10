export interface CreateOtpI {
  readonly phone?: string;
  readonly email?: string;
}

export interface OtpI {
  readonly _id: string;
  readonly otp: number;
  readonly status: string;
  readonly validSeconds: number;
  readonly attempts: number;
  readonly phone: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
