export interface ServiceI {
  readonly name: string;
  readonly title: string;
  readonly subTitle: string;
  readonly description: string;
  readonly subDescription: string;
  readonly mainImage: {
    readonly url: string;
    readonly fileName: string;
  }[];
  readonly mainGallery: {
    readonly url: string;
    readonly fileName: string;
  }[];
  readonly subGallery: {
    readonly url: string;
    readonly fileName: string;
  }[];
}

export interface ServiceQueryI {
  readonly enableBooking: boolean;
}

export interface createServiceI {
  readonly name: string;
  readonly title: string;
  readonly subTitle: string;
  readonly description: string;
  readonly subDescription: string;
  readonly publishInServicePage: boolean;
  readonly groupService: string;
  readonly specialInstruction: string;
  readonly enableBooking: boolean;
}

export interface updateServiceI {
  readonly name?: string;
  readonly title?: string;
  readonly subTitle?: string;
  readonly description?: string;
  readonly subDescription?: string;
  readonly publishInServicePage?: boolean;
  readonly groupService?: string;
  readonly enableBooking?: boolean;
}
