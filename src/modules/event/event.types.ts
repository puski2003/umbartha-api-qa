export interface EventI {
  category: string;
  title: string;
  description: string;
  dates: {
    dateFrom: Date;
    dateTo: Date;
  }[];
  timings: {
    from: Date;
    to: Date;
  }[];
  location: {
    eventType: string;
    name: string;
    link: string;
  };
  speakers: {
    name: string;
    designation: string;
    link: string;
  }[];
  gallery: {
    url: string;
    fileName: string;
    featured: boolean;
  }[];
}

export interface CreateEventI {
  category: string;
  title: string;
  description: string;
  dates: {
    dateFrom: Date;
    dateTo: Date;
  }[];
  location: {
    eventType: string;
    name: string;
    link: string;
  };
}

export interface TimingsI {
  from: Date;
  to: Date;
}

export interface LocationI {
  eventType?: string;
  name?: string;
  link?: string;
}

export interface SpeakerI {
  name: string;
  designation: string;
  link: string;
}

export interface GalleryI {
  featured: boolean;
}

export interface EventRegistrationFilterI {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly eventTitle?: string;
  readonly serviceName?: string;
  readonly date?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
}
