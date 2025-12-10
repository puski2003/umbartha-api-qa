export interface CounsellorI {
  readonly userId: string;
  readonly title: string;
  readonly profilePictureURL: string;
  readonly gender: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly email: string;
  readonly hotline: string;
  readonly mobile: string;
  readonly dateOfBirth: string;
  readonly practiceStartedOn: string;
  readonly description: string;
  readonly languagesSpoken: string[];
  readonly sessionType: string[];
  readonly services: {
    readonly name: string;
    readonly description: string;
  }[];
  readonly specialization: string[];
  readonly credentials: string[];
  readonly licenses: {
    readonly licenseType: string;
    readonly licenseNumber: string;
    readonly licenseExpirationDate: string;
  }[];
}

export interface CreateCounsellorI {
  readonly index: number;
  readonly title: string;
  readonly gender: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly hotline: string;
  readonly mobile: string;
  readonly dateOfBirth: string;
  readonly practiceStartedOn: string;
  readonly description: string;
  readonly languagesSpoken: string[];
  readonly sessionType: string[];
  readonly specialization: string[];
  readonly credentials: string[];
  readonly licenses: {
    readonly licenseType: string;
    readonly licenseNumber: string;
    readonly licenseExpirationDate: string;
  }[];
}

export interface UpdateCounsellorI {
  readonly title?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly hotline?: string;
  readonly mobile?: string;
  readonly description?: string;
  readonly languagesSpoken?: string[];
  readonly sessionType?: string[];
  readonly specialization?: string[];
  readonly credentials?: string[];
  readonly licenses?: {
    readonly licenseType?: string;
    readonly licenseNumber?: string;
    readonly licenseExpirationDate?: string;
  }[];
}

export interface ChangeStatusI {
  readonly status: string;
}

export interface CounsellorQueryI {
  readonly publishAppointments: boolean;
}
