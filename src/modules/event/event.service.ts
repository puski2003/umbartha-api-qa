import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EVENT_COLLECTION } from './event.constants';
import { Model, Types } from 'mongoose';
import { Event, EventType } from './schema/event.schema';
import {
  CreateEventI,
  GalleryI,
  LocationI,
  SpeakerI,
  TimingsI,
} from './event.types';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { isEmpty } from 'class-validator';
import { EventCategoryService } from './event-category.service';
import { Readable } from 'stream';
import { ServiceService } from '../service/service.service';
import { TestimonialService } from '../testimonial/testimonial.service';

const T = {
  eventNotFound: 'event is not found',
  validTimings: 'please provide valid timings',
};

@Injectable()
export class EventService {
  constructor(
    @InjectModel(EVENT_COLLECTION) private readonly eventModel: Model<Event>,
    private readonly categoryService: EventCategoryService,
    private readonly s3Service: S3Service,
    private readonly serviceService: ServiceService,
    private readonly testimonialService: TestimonialService,
  ) {}

  async findAll(limit: number, page: number) {
    const filter = {
      type: { $ne: EventType.Service },
    };

    const totalDocs = await this.eventModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const eventsCheck = await this.eventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean()
      .populate([{ path: 'category', select: 'name description' }]);

    for (const event of eventsCheck) {
      event.timings.sort(
        (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
      );
    }

    return {
      docs: eventsCheck,
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

  async findSelectedEvent(target: string) {
    const eventCheck = await this.eventModel
      .findById(target)
      .lean()
      .populate([{ path: 'category', select: 'name description' }]);

    if (isEmpty(eventCheck)) {
      Logger.error(T.eventNotFound);
      throw new BadRequestException(T.eventNotFound);
    }

    const eventTestimonials =
      await this.testimonialService.findAllTestimonialsByEvent(target);

    eventCheck?.timings?.sort(
      (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
    );
    return { ...eventCheck, testimonials: eventTestimonials };
  }

  async createEvent(event: CreateEventI): Promise<Event> {
    await this.categoryService.findSelectedCategory(event.category);

    const createdEvent = await this.eventModel.create({
      ...event,
      dates: [{ _id: new Types.ObjectId(), ...event.dates[0] }],
    });
    return createdEvent;
  }

  async deleteEvent(eventId: string) {
    await this.findSelectedEvent(eventId);

    const removedEvent = await this.eventModel.findByIdAndRemove(eventId);
    return removedEvent;
  }

  async addTimingsForEvent(eventId: string, timing: TimingsI) {
    const eventCheck = await this.findSelectedEvent(eventId);

    if (
      timing.from < eventCheck.dates[0]?.dateFrom &&
      timing.to > eventCheck.dates[0]?.dateTo
    ) {
      Logger.error(T.validTimings.toUpperCase());
      throw new BadRequestException(T.validTimings);
    }

    if (timing.from >= timing.to) {
      Logger.error(T.validTimings.toUpperCase());
      throw new BadRequestException(T.validTimings);
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $push: { timings: { _id: new Types.ObjectId(), ...timing } },
        },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async removeTimingsFromEvent(eventId: string, timingId: string) {
    const eventCheck = await this.eventModel.findOne({
      _id: eventId,
      timings: { $elemMatch: { _id: new Types.ObjectId(timingId) } },
    });
    if (isEmpty(eventCheck)) {
      Logger.error(
        `${T.eventNotFound.toUpperCase()} or event timing is not found`,
      );
      throw new BadRequestException(
        `${T.eventNotFound} or event timing is not found`,
      );
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $pull: { timings: { _id: new Types.ObjectId(timingId) } },
        },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async updateLocation(eventId: string, location: LocationI) {
    const eventCheck = await this.findSelectedEvent(eventId);

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $set: { location: { ...eventCheck.location, ...location } } },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async addSpeakerForEvent(eventId: string, speaker: SpeakerI) {
    await this.findSelectedEvent(eventId);

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $push: { speakers: { _id: new Types.ObjectId(), ...speaker } },
        },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async removeSpeakerFromEvent(eventId: string, speakerId: string) {
    const eventCheck = await this.eventModel.findOne({
      _id: eventId,
      speakers: { $elemMatch: { _id: new Types.ObjectId(speakerId) } },
    });
    if (isEmpty(eventCheck)) {
      Logger.error(
        `${T.eventNotFound.toUpperCase()} or event speaker is not found`,
      );
      throw new BadRequestException(
        `${T.eventNotFound} or event speaker is not found`,
      );
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $pull: { speakers: { _id: new Types.ObjectId(speakerId) } },
        },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async addGalleryForEvent(
    eventId: string,
    gallery: GalleryI,
    file: Express.Multer.File,
  ) {
    const eventCheck = await this.findSelectedEvent(eventId);
    if (gallery.featured) {
      eventCheck.gallery.map(async (d) => {
        if (d.featured) {
          await this.eventModel
            .findOneAndUpdate(
              {
                _id: eventId,
                gallery: { $elemMatch: { _id: new Types.ObjectId(d._id) } },
              },
              { $set: { 'gallery.$.featured': false } },
              { new: true, lean: true },
            )
            .lean();
        }
      });
    }

    const galleryUpdated = await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      'event/gallery',
      file.originalname,
      file.mimetype,
      file.buffer,
    );
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $push: {
            gallery: {
              _id: new Types.ObjectId(),
              ...galleryUpdated,
              ...gallery,
            },
          },
        },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
  }

  async changeFeatureImage(eventId: string, galleryId: string) {
    const eventCheck = await this.eventModel
      .findOne({
        _id: eventId,
        gallery: { $elemMatch: { _id: new Types.ObjectId(galleryId) } },
      })
      .lean();

    eventCheck?.gallery.map(async (d) => {
      if (d.featured) {
        await this.eventModel
          .findOneAndUpdate(
            {
              _id: eventId,
              gallery: { $elemMatch: { _id: new Types.ObjectId(d._id) } },
            },
            { $set: { 'gallery.$.featured': false } },
            { new: true, lean: true },
          )
          .lean();
      }
    });

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      {
        _id: eventId,
        gallery: { $elemMatch: { _id: new Types.ObjectId(galleryId) } },
      },
      { $set: { 'gallery.$.featured': true } },
      { new: true, lean: true },
    );
    return updatedEvent;
  }

  async removeGalleryFromEvent(eventId: string, galleryId: string) {
    const eventCheck = await this.eventModel
      .findOne(
        {
          _id: eventId,
          gallery: { $elemMatch: { _id: new Types.ObjectId(galleryId) } },
        },
        { 'gallery.$': 1 },
      )
      .lean();

    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      eventCheck?.gallery[0].fileName,
    );

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { gallery: { _id: new Types.ObjectId(galleryId) } } },
        { new: true, lean: true },
      )
      .lean();
    return updatedEvent;
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
          url: `event/gallery/base64?key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          uri: `data:image/webp;base64,${base64Image}`,
        };
      });
  }

  async imageDataUrl(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      `${process.env.S3_UMBARTHA_BUCKET_NAME}`,
      key,
    );
    // const base64Img = await body.transformToString('base64');
    // const dataUrl = `data:${mimetype};base64,${base64Img}`;

    return body as Readable;
  }
}
