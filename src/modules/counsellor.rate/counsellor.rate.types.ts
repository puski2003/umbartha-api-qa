export interface RateI {
  readonly _id: string;
  readonly hourFrom: number;
  readonly hourTo: number;
  readonly rate: number;
  readonly currency: string;
  readonly country: string;
  readonly nationality: string;
  readonly counsellor: string;
  readonly defaultRate: boolean;
  readonly createBy: string;
}

export interface CreateRateI {
  readonly hourFrom: number;
  readonly hourTo: number;
  readonly rate: number;
  readonly currency: string;
  readonly country: string;
  readonly nationality: string;
  readonly counsellor: string;
  readonly defaultRate: boolean;
  readonly service: string;
}

export interface UpdateRateI {
  readonly hourFrom?: number;
  readonly hourTo?: number;
  readonly rate?: number;
  readonly currency?: string;
  readonly country?: string;
  readonly nationality?: string;
  readonly defaultRate?: boolean;
}
