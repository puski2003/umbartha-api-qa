import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery_COLLECTION } from 'src/modules/gallery/gallery.constants';
import {
  Gallery,
  GalleryVisibility,
} from 'src/modules/gallery/schema/gallery.schema';

@Injectable()
export class PublicGalleryService {
  constructor(
    @InjectModel(Gallery_COLLECTION)
    private readonly galleryModel: Model<Gallery>,
  ) {}

  async findPublicGallery(limit: number, page: number) {
    const filter: any = {};
    filter.visibility = GalleryVisibility.PUBLIC;

    const totalDocs = await this.galleryModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const galleryCheck = await this.galleryModel
      .find(filter)
      .limit(limit)
      .skip(limit * (page - 1))
      .populate([{ path: 'event', select: 'title' }])
      .lean();

    return {
      docs: galleryCheck,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: limit,
        nextPage: page + 1,
        page: page,
        prevPage: page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }
}
