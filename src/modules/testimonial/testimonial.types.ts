export interface TestimonialI {
  readonly name: string;
  readonly title: string;
  readonly testimonial: string;
  readonly photo: {
    readonly url: string;
    readonly fileName: string;
  };
}

export interface CreateTestimonialI {
  readonly _serviceId: string;
  readonly name: string;
  readonly title: string;
  readonly testimonial: string;
}

export interface UpdateTestimonialI {
  readonly name: string;
  readonly title: string;
  readonly testimonial: string;
}
