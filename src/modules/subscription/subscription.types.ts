export interface SubscriptionI {
  readonly email: string;
  readonly createdDate: Date;
  readonly updatedBy: string;
  readonly updatedOn: Date;
  readonly status: string; // should be an enum
}

export interface CreateSubscriptionI {
  readonly email: string;
  readonly type: string;
  readonly timeZone: string;
}
