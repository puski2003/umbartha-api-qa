export interface GalleryI {
  readonly _id: string;
  readonly title: string;
  readonly description: string;
  readonly event: string;
  readonly createdDate: Date;
  readonly updatedBy: string;
  readonly updatedOn: Date;
  readonly visibility: string;
}

export interface CreateGalleryI {
  readonly title: string;
  readonly description: string;
  readonly event: string;
  readonly visibility: string;
}

export interface UpdateGalleryI {
  readonly title: string;
  readonly description: string;
  readonly event: string;
  readonly visibility: string;
}
