import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Service } from './schema/service.schema';
import { Model, Types } from 'mongoose';
import { createServiceI, ServiceQueryI, updateServiceI } from './service.types';
import { SERVICE_COLLECTION } from './service.constants';
import { isEmpty, isNotEmpty } from 'class-validator';
import { User } from 'src/config/authorization/user.decorator';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { EVENT_COLLECTION } from '../event/event.constants';
import { Event, EventType } from '../event/schema/event.schema';
import { TESTIMONIAL_COLLECTION } from '../testimonial/testimonial.constants';
import { Testimonial } from '../testimonial/schema/testimonial.schema';

const T = {
  serviceNotFound: 'service is not found',
  galleryNotFound: 'service gallery is not found',
};

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(SERVICE_COLLECTION)
    private readonly serviceModel: Model<Service>,
    @InjectModel(EVENT_COLLECTION) private readonly eventModel: Model<Event>,
    private readonly s3Service: S3Service,
    @InjectModel(TESTIMONIAL_COLLECTION)
    private readonly testimonialModel: Model<Testimonial>,
  ) {}

  async findAll(limit: number, page: number, query?: ServiceQueryI) {
    const filter: any = {};

    if (isNotEmpty(query?.enableBooking))
      filter.enableBooking = query.enableBooking;

    const totalDocs = await this.serviceModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const servicesCheck = await this.serviceModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .populate('groupService')
      .lean();

    return {
      docs: servicesCheck,
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

  async findSelectedService(serviceId: string) {
    const serviceCheck = await this.serviceModel
      .findById(serviceId)
      .populate('groupService')
      .lean();

    const childServicesArray = await this.serviceModel.find({
      groupService: new Types.ObjectId(serviceId),
    });

    const testimonialsCheck = await this.testimonialModel.find({
      _serviceId: new Types.ObjectId(serviceId),
    });

    if (isEmpty(serviceCheck)) {
      Logger.debug(T.serviceNotFound.toUpperCase());
      throw new NotFoundException(T.serviceNotFound);
    }
    return {
      ...serviceCheck,
      childServices: childServicesArray,
      testimonials: testimonialsCheck,
    };
  }

  async cerateService(user: User, service: createServiceI): Promise<Service> {
    if (isNotEmpty(service.groupService)) {
      await this.findSelectedService(service?.groupService);
    }

    const createdService = await this.serviceModel
      .create({
        ...service,
        ...(isNotEmpty(service.groupService)
          ? { groupService: new Types.ObjectId(service.groupService) }
          : {}),
        createdBy: user.user,
      })
      .then(async (d) => {
        await this.eventModel.create({
          _id: new Types.ObjectId(d._id),
          title: d.name,
          description: d.title,
          type: EventType.Service,
          gallery: [d.mainImage, d.mainGallery, d.subGallery],
          specialInstruction: service?.specialInstruction,
        });

        return d;
      });

    return createdService;
  }

  async updateService(
    serviceId: string,
    service: updateServiceI,
  ): Promise<Service> {
    await this.findSelectedService(serviceId);

    const updatedService = await this.serviceModel
      .findByIdAndUpdate(
        { _id: serviceId },
        {
          $set: {
            ...service,
            groupService: new Types.ObjectId(service.groupService),
          },
        },
        { new: true, lean: true },
      )
      .populate('groupService')
      .lean()
      .then(async (d) => {
        await this.eventModel.findByIdAndUpdate(
          serviceId,
          {
            ...d,
            galler: [d.mainImage, d.mainGallery, d.subGallery],
          },
          { new: true, upsert: true },
        );

        return d;
      });
    return updatedService;
  }

  async removeGroupServiceFromChildService(
    serviceId: string,
    groupServiceId: string,
  ) {
    const serviceCheck = await this.serviceModel.findOne({
      _id: new Types.ObjectId(serviceId),
      groupService: new Types.ObjectId(groupServiceId),
    });

    if (isEmpty(serviceCheck)) throw new NotFoundException(T.serviceNotFound);

    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $unset: { groupService: new Types.ObjectId(groupServiceId) } },
      { new: true },
    );

    return updatedService;
  }

  async deleteSelectedService(serviceId: string): Promise<Service> {
    await this.findSelectedService(serviceId);

    const deletedService = await this.serviceModel
      .findByIdAndRemove(serviceId)
      .lean()
      .then(async (d) => {
        await this.eventModel.findByIdAndDelete(serviceId);
        return d;
      });
    return deletedService;
  }

  async imageDataUrl(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async addGalleryToService(
    serviceId: string,
    grid: string,
    file: Express.Multer.File,
  ) {
    const serviceCheck = await this.findSelectedService(serviceId);
    if (isNotEmpty(serviceCheck.mainImage[0]) && grid === 'mainImage') {
      await this.deleteGallery(serviceId, serviceCheck.mainImage[0]._id);
    }

    const galleryUpdated = await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `service/${grid}-gallery`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    const updatedService = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        {
          $set: {
            ...(grid === 'mainImage'
              ? { mainImage: { _id: new Types.ObjectId(), ...galleryUpdated } }
              : {}),
          },

          $push: {
            ...(grid === 'mainGallery'
              ? {
                  mainGallery: { _id: new Types.ObjectId(), ...galleryUpdated },
                }
              : {}),
            ...(grid === 'subGallery'
              ? { subGallery: { _id: new Types.ObjectId(), ...galleryUpdated } }
              : {}),
          },
        },
        { new: true, lean: true },
      )
      .lean()
      .then(async (d) => {
        await this.eventModel.findByIdAndUpdate(
          serviceId,
          {
            ...d,
            galler: [d.mainImage, d.mainGallery, d.subGallery],
          },
          { new: true, upsert: true },
        );

        return d;
      });

    return updatedService;
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

    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        return {
          url: `service/gallery/photo?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          uri: `data:image/webp;base64,${base64Image}`,
        };
      });
  }

  async deleteGallery(serviceId: string, galleryId: string) {
    const galleryCheck = await this.serviceModel
      .findOne(
        {
          _id: new Types.ObjectId(serviceId),
          $or: [
            {
              mainImage: { $elemMatch: { _id: new Types.ObjectId(galleryId) } },
            },
            {
              mainGallery: {
                $elemMatch: { _id: new Types.ObjectId(galleryId) },
              },
            },
            {
              subGallery: {
                $elemMatch: { _id: new Types.ObjectId(galleryId) },
              },
            },
          ],
        },
        {
          mainImage: { $elemMatch: { _id: new Types.ObjectId(galleryId) } },
          mainGallery: {
            $elemMatch: { _id: new Types.ObjectId(galleryId) },
          },
          subGallery: {
            $elemMatch: { _id: new Types.ObjectId(galleryId) },
          },
        },
      )
      .lean()
      .then(async (d) => {
        await this.eventModel.findByIdAndUpdate(
          serviceId,
          {
            ...d,
            galler: [d.mainImage, d.mainGallery, d.subGallery],
          },
          { new: true, upsert: true },
        );

        return d;
      });

    if (
      isEmpty(
        (galleryCheck?.mainImage && galleryCheck?.mainImage[0]) ||
          (galleryCheck?.mainGallery && galleryCheck?.mainGallery[0]) ||
          (galleryCheck?.subGallery && galleryCheck?.subGallery[0]),
      )
    ) {
      Logger.error(T.galleryNotFound.toUpperCase());
      throw new NotFoundException(T.galleryNotFound);
    }

    let fileName: string;
    if (isNotEmpty(galleryCheck?.mainImage?.[0]?.fileName)) {
      fileName = galleryCheck.mainImage[0].fileName;
    } else if (isNotEmpty(galleryCheck?.mainGallery?.[0]?.fileName)) {
      fileName = galleryCheck.mainGallery[0].fileName;
    } else if (isNotEmpty(galleryCheck?.subGallery?.[0]?.fileName)) {
      fileName = galleryCheck.subGallery[0].fileName;
    } else {
      fileName = undefined;
    }

    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      fileName,
    );

    const updatedService = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        {
          $pull: {
            ...(galleryCheck?.mainImage
              ? { mainImage: { _id: new Types.ObjectId(galleryId) } }
              : {}),
            ...(galleryCheck?.mainGallery
              ? { mainGallery: { _id: new Types.ObjectId(galleryId) } }
              : {}),
            ...(galleryCheck?.subGallery
              ? { subGallery: { _id: new Types.ObjectId(galleryId) } }
              : {}),
          },
        },
        { new: true, lean: true },
      )
      .lean()
      .then(async (d) => {
        await this.eventModel.findByIdAndUpdate(
          serviceId,
          {
            ...d,
            galler: [d.mainImage, d.mainGallery, d.subGallery],
          },
          { new: true, upsert: true },
        );

        return d;
      });
    return updatedService;
  }
}
