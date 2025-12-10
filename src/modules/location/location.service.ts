import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location } from './schemas/location.schema';
import mongoose, { Model, Types } from 'mongoose';
import { User } from 'src/config/authorization/user.decorator';
import {
  CreateClosedDatePlanI,
  CreateLocationI,
  UpdateLocationI,
  UploadGalleryI,
} from './location.types';
import { isEmpty } from 'class-validator';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { LOCATION_COLLECTION } from './location.constants';

const T = {
  locationNotFound: 'location is not found',
};

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(LOCATION_COLLECTION)
    private readonly locationModel: Model<Location>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(limit: number, page: number) {
    const totalDocs = await this.locationModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const locationsCheck = await this.locationModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: locationsCheck,
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

  async findSelectedLocation(locationId: string): Promise<Location> {
    const locationCheck = await this.locationModel.findById(locationId).lean();

    if (isEmpty(locationCheck)) {
      throw new NotFoundException(T.locationNotFound);
    }
    return locationCheck;
  }

  async createLocation(
    user: User,
    location: CreateLocationI,
  ): Promise<Location> {
    const createdLocation = await this.locationModel.create({
      ceratedBy: user.user,
      ...location,
    });

    return createdLocation;
  }

  async updateLocation(
    locationId: string,
    location: UpdateLocationI,
  ): Promise<Location> {
    await this.findSelectedLocation(locationId);

    const existingLocation = await this.locationModel.findByIdAndUpdate(
      { _id: locationId },
      { $set: location },
      { new: true, lean: true },
    );
    return existingLocation;
  }

  async removeLocation(locationId: string): Promise<Location> {
    const locationCheck = await this.findSelectedLocation(locationId);

    for (const gallery of locationCheck.gallery) {
      // call the mediaService to remove file associated with ther gallery
      await this.removeGalleryFromLocation(locationId, gallery._id);
    }

    const deletedLocation = await this.locationModel.findByIdAndDelete(
      locationId,
    );
    return deletedLocation;
  }

  async getImage(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async addGalleryForLocation(
    locationId: string,
    gallery: UploadGalleryI,
    file: Express.Multer.File,
  ): Promise<Location> {
    await this.findSelectedLocation(locationId);

    const galleryUpdated = await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `location/gallery`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    const updatedLocation = await this.locationModel.findByIdAndUpdate(
      locationId,
      {
        $push: {
          gallery: {
            _id: new Types.ObjectId(),
            public: gallery.public,
            ...galleryUpdated,
          },
        },
      },
      { new: true, lean: true },
    );

    return updatedLocation;
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

    Logger.verbose('Uploading photo for record...', 'Location');
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record image upload successful', 'Location');
        return {
          url: `location/gallery/photo?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          uri: `data:image/webp;base64,${base64Image}`,
        };
      });
  }

  async removeGalleryFromLocation(
    locationId: string,
    galleryId: string,
  ): Promise<Location> {
    const locationCheck = await this.locationModel
      .findOne(
        {
          _id: locationId,
          'gallery._id': galleryId,
        },
        { gallery: { $elemMatch: { _id: new Types.ObjectId(galleryId) } } },
      )
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new NotFoundException(T.locationNotFound);
        }

        return d;
      });

    console.log('locationCheck: ', locationCheck);

    Logger.verbose('Deleting photo for record...', 'Testimonial');
    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      locationCheck.gallery[0].fileName,
    );
    Logger.verbose('Photo deleted for record', 'Testimonial');

    const updatedLocation = await this.locationModel
      .findOneAndUpdate(
        { _id: locationId, 'gallery._id': galleryId },
        { $pull: { gallery: { _id: galleryId } } },
        { new: true, lean: true },
      )
      .lean();

    return updatedLocation;
  }

  async addClosedDatePlaneForLocation(
    locationId: string,
    closedDatePlan: CreateClosedDatePlanI,
  ): Promise<Location> {
    await this.findSelectedLocation(locationId);

    const location = await this.locationModel
      .findByIdAndUpdate(
        { _id: locationId },
        {
          $push: {
            closedDatePlan: {
              type: closedDatePlan.type,
              valueFrom: closedDatePlan.valueFrom,
              valueTo: closedDatePlan.valueTo,
            },
          },
        },
        { new: true },
      )
      .lean();
    return location;
  }

  async removeClosedDatePlan(
    locarionId: string,
    closedDatePlanId: string,
  ): Promise<Location> {
    await this.findSelectedLocation(locarionId);

    // checking the provided ID is a valid ObjectId
    const isValidClosedDatePlanId = mongoose.isValidObjectId(closedDatePlanId);
    if (!isValidClosedDatePlanId)
      throw new BadRequestException(
        `ClosedDatePlan #${closedDatePlanId} is not valid`,
      );

    const updateClosedDatePlane = await this.locationModel
      .findOneAndUpdate(
        { 'closedDatePlan._id': closedDatePlanId },
        { $pull: { closedDatePlan: { _id: closedDatePlanId } } },
        { new: true },
      )
      .lean();
    if (!updateClosedDatePlane)
      throw new NotFoundException(
        `ClosedDatePlan #${closedDatePlanId} is not found`,
      );
    return updateClosedDatePlane;
  }
}
