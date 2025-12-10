export interface FAQI {
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly createdBy: string;
}

export interface CerateFaqI {
  readonly title: string;
  readonly description: string;
  order: number;
}

export interface UpdateFaqI {
  readonly title: string;
  readonly description: string;
}
