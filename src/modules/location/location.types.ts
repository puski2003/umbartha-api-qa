export interface Location {
  readonly name: string;
  readonly meetingRoom: boolean;
  readonly gallery: {
    readonly url: string;
    readonly public: string;
    readonly fileName: string;
  }[];
  readonly closedDatePlan: {
    readonly type: string;
    readonly valueFrom: string;
    readonly valueTo: string;
  };
  readonly ceratedBy: string;
}

export interface CreateLocationI {
  name: string;
  meetingRoom: boolean;
}

export interface UploadGalleryI {
  public: string;
}

export interface CreateClosedDatePlanI {
  type: string;
  valueFrom: string;
  valueTo: string;
}

export interface UpdateLocationI {
  name: string;
  meetingRoom: boolean;
}
