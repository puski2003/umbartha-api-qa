import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gallery_COLLECTION } from './gallery.constants';
import { Model, Types } from 'mongoose';
import { Gallery, GalleryVisibility } from './schema/gallery.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { CreateGalleryI, UpdateGalleryI } from './gallery.types';
import { EventService } from '../event/event.service';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(Gallery_COLLECTION)
    private readonly galleryModel: Model<Gallery>,
    private readonly eventService: EventService,
    private readonly s3Service: S3Service,
  ) {}

  async findAllGallery(limit: number, page: number) {
    const totalDocs = await this.galleryModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const galleryCheck = await this.galleryModel
      .find()
      .limit(limit)
      .skip(limit * (page - 1))
      .populate([
        {
          path: 'event',
          select: 'title description',
        },
      ])
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

  async findSelectedGallery(galleryId: string) {
    const galleryCheck = await this.galleryModel
      .findById(galleryId)
      .populate({
        path: 'event',
        select: 'title description',
      })
      .lean();

    if (isEmpty(galleryCheck)) {
      throw new NotFoundException('gallery is not found');
    }

    return galleryCheck;
  }

  async createGallery(gallery: CreateGalleryI, file: Express.Multer.File) {
    if (isNotEmpty(gallery.event)) {
      await this.eventService.findSelectedEvent(gallery.event);
    }

    let galleryUpdated;
    if (isNotEmpty(file)) {
      galleryUpdated = await this.imageUrl(
        process.env.S3_UMBARTHA_BUCKET_NAME,
        `gallery/image`,
        file.originalname,
        file.mimetype,
        file.buffer,
      );
    }

    const createdGallery = await this.galleryModel.create({
      ...gallery,
      ...(isNotEmpty(gallery?.event)
        ? { event: new Types.ObjectId(gallery.event) }
        : {}),
      ...(isNotEmpty(galleryUpdated)
        ? {
            image: {
              _id: new Types.ObjectId(),
              ...galleryUpdated,
            },
          }
        : {}),
    });
    return createdGallery;
  }

  async updatedGallery(
    galleryId: string,
    gallery: UpdateGalleryI,
    file: Express.Multer.File,
  ) {
    const galleryCheck = await this.findSelectedGallery(galleryId);

    if (isNotEmpty(gallery.event)) {
      await this.eventService.findSelectedEvent(gallery.event);
    }

    let galleryUpdated;
    if (isNotEmpty(file)) {
      if (isNotEmpty(galleryCheck.image)) {
        await this.removeImageFromGallery(galleryId, galleryCheck.image._id);
      }

      galleryUpdated = await this.imageUrl(
        process.env.S3_UMBARTHA_BUCKET_NAME,
        `gallery/image`,
        file.originalname,
        file.mimetype,
        file.buffer,
      );
    }

    const updatedGallery = await this.galleryModel.findByIdAndUpdate(
      galleryId,
      {
        $set: {
          ...gallery,
          ...(isNotEmpty(gallery.event)
            ? { event: new Types.ObjectId(gallery.event) }
            : {}),
          ...(isNotEmpty(file)
            ? {
                image: {
                  _id: new Types.ObjectId(),
                  ...galleryUpdated,
                },
              }
            : { image: galleryCheck.image }),
        },
      },
      { new: true, lean: true },
    );
    return updatedGallery;
  }

  async changeVisibility(galleryId: string) {
    const galleryCheck = await this.findSelectedGallery(galleryId);

    const updatedGallery = await this.galleryModel.findByIdAndUpdate(
      galleryId,
      {
        $set: {
          ...(galleryCheck.visibility === GalleryVisibility.PRIVATE
            ? { visibility: GalleryVisibility.PUBLIC }
            : { visibility: GalleryVisibility.PRIVATE }),
        },
      },
      { new: true, lean: true },
    );

    return updatedGallery;
  }

  async getImage(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async addImageToGallery(galleryId: string, file: Express.Multer.File) {
    const galleryCheck = await this.findSelectedGallery(galleryId);
    if (isNotEmpty(galleryCheck.image)) {
      await this.removeImageFromGallery(galleryId, galleryCheck.image._id);
    }

    const galleryUpdated = await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `gallery/image`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    const updatedGallery = await this.galleryModel.findByIdAndUpdate(
      galleryId,
      { $set: { image: { _id: new Types.ObjectId(), ...galleryUpdated } } },
      { new: true, lean: true },
    );

    return updatedGallery;
  }

  async deleteGallery(galleryId: string) {
    await this.findSelectedGallery(galleryId);

    const deletedGallery = await this.galleryModel.findByIdAndRemove(galleryId);
    return deletedGallery;
  }

  async imageUrl(
    buckectName: string,
    folderName: string,
    fileName: string,
    mimetype: string,
    file: Buffer,
  ) {
    const key = `${folderName}/${new Date().getTime()}-${fileName}`;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sharp = require('sharp');
    let base64Image;
    await sharp(file)
      .resize(100)
      .webp()
      .toBuffer()
      .then(async (d) => {
        base64Image = d.toString('base64');
      });

    // // convert binary data to base64 encoded string
    // const base64Image = file.toString('base64');

    Logger.verbose('Uploading photo for record...', 'Gallery');
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record image upload successful', 'Gallery');
        return {
          url: `gallery/image/photo?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          uri: `data:image/webp;base64,${base64Image}`,
        };
      });
  }

  async removeImageFromGallery(galleryId: string, imageId: string) {
    const galleryCheck = await this.galleryModel
      .findOne({
        _id: galleryId,
        'image._id': imageId,
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.warn('gallery is not found', 'Gallery');
          throw new BadRequestException('gallery is not found');
        }

        return d;
      });

    Logger.verbose('Deleting photo for record...', 'Gallery');
    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      galleryCheck.image.fileName,
    );
    Logger.verbose('Photo deleted for record', 'Gallery');

    const updatedGallery = await this.galleryModel.findOneAndUpdate(
      { 'image._id': imageId },
      { $unset: { image: { _id: new Types.ObjectId(imageId) } } },
      { new: true, lean: true },
    );
    return updatedGallery;
  }
}
