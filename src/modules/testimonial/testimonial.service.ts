import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Testimonial } from './schema/testimonial.schema';
import { Model, Types } from 'mongoose';
import { CreateTestimonialI, UpdateTestimonialI } from './testimonial.types';
import { isEmpty, isNotEmpty } from 'class-validator';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { PaginatedObjI } from 'src/config/common/types/paginated-object.type';
import { User } from 'src/config/authorization/user.decorator';
import { ImageUploadI } from 'src/config/common/types/image-upload.type';
import Jimp from 'jimp';

/**
 *
 * Error messages for testimonials
 */
const message = {
  testimonialNotFound: 'testimonial is not found',
};

@Injectable()
export class TestimonialService {
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<Testimonial>,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Retrieves a paginated list of testimonials
   *
   * @param limit
   * @param page
   * @returns promise that resolves to an object containing an array of testimonials and pagination details
   * @throws ForbiddenException if the user is not a super admin
   */
  async findAll(
    user: User,
    limit: number,
    page: number,
  ): Promise<PaginatedObjI> {
    /**
     * If user is not super admin, throw a ForbuddenException
     */
    if (!user.isSuperAdmin && !user.isAdmin && !user.isStaffManager)
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );

    /**
     * Count total number of testimonial
     */
    const totalDocs = await this.testimonialModel.countDocuments();

    /**
     * Calculate the total number of pages based on limit
     */
    const totalPages = Math.ceil(totalDocs / limit);

    /**
     * Retrieve testimonials
     */
    const testimonialsCheck = await this.testimonialModel
      .find()
      .populate('_serviceId')
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: testimonialsCheck,
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

  /**
   * Retrieves a specific testimonial by Id
   *
   * @param user
   * @param testimonialId
   * @returns promise that resolves to the testimonial object if found
   * @throws ForbiddenException if the user is not a super admin
   * @throws NotFounException if the testimonial is not found
   */
  async findSelectedTestimonial(
    user: User,
    testimonialId: string,
  ): Promise<Testimonial> {
    /**
     * If user is not super admin, throw a ForbuddenException
     */
    if (!user.isSuperAdmin && !user.isAdmin && !user.isStaffManager)
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );

    /**
     * Retrieve the testimonial by Id
     */
    const testimonialCheck = await this.testimonialModel
      .findById(testimonialId)
      .populate('_serviceId event')
      .lean();

    /**
     * If the testimonial is not found, throw a NotFoundException
     */
    if (isEmpty(testimonialCheck))
      throw new NotFoundException(message.testimonialNotFound);

    return testimonialCheck;
  }

  async findAllTestimonialsByEvent(event: string): Promise<Testimonial[]> {
    /**
     * Retrieve testimonials by event Id
     */
    const testimonialsCheck = await this.testimonialModel
      .find(
        { event: event },
        {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      )
      .lean();

    return testimonialsCheck;
  }

  /**
   * Create a new testimonial
   *
   * @param testimonial
   * @param file
   * @returns promise that resolves to the created testimonial object
   */
  async createdSelectedTestimonial(
    testimonial: CreateTestimonialI,
    file: Express.Multer.File,
  ): Promise<Testimonial> {
    let galleryUpdated: ImageUploadI;

    /**
     * If a file is provided, upload the image to S3 buckect
     */
    if (isNotEmpty(file)) {
      galleryUpdated = await this.imageUrl(
        process.env.S3_UMBARTHA_BUCKET_NAME,
        `testimonial/gallery`,
        file.originalname,
        file.mimetype,
        file.buffer,
      );
    }

    /**
     * Create a new testimonial document with
     */
    const createdTestimonial = await this.testimonialModel.create({
      ...testimonial,
      photo: galleryUpdated,
      ...(isNotEmpty(testimonial._serviceId)
        ? { _serviceId: new Types.ObjectId(testimonial._serviceId) }
        : {}),
    });
    return createdTestimonial;
  }

  /**
   * Updates a specific tetimonial by Id
   *
   * @param user
   * @param testimonialId
   * @param testimonial
   * @param file
   * @returns promise that resolves to the updated testimonial object
   * @throws ForbiddenException if the user is not a super admin
   * @throws NotFoundException if the testimonial is not found
   */
  async updateSelectedTestimonial(
    user: User,
    testimonialId: string,
    testimonial: UpdateTestimonialI,
    file: Express.Multer.File,
  ): Promise<Testimonial> {
    /**
     * Retrieve the existing testimonial by Id
     */
    const testimonialCheck = await this.findSelectedTestimonial(
      user,
      testimonialId,
    );

    let galleryUpdated: ImageUploadI;

    /**
     * If a new file is provided, handle the image upload process
     */
    if (isNotEmpty(file)) {
      /**
       * If the tesyimonial already has a photo, remove the existing photo
       */
      if (isNotEmpty(testimonialCheck.photo))
        await this.removeImageFromTestimonial(
          testimonialId,
          testimonialCheck.photo._id,
        );

      /**
       * Upload the nwe image to the S3 byckect
       */
      galleryUpdated = await this.imageUrl(
        process.env.S3_UMBARTHA_BUCKET_NAME,
        `testimonial/gallery`,
        file.originalname,
        file.mimetype,
        file.buffer,
      );
    }

    /**
     * Update the testimonial
     * If a new photo was uploaded, update that
     */
    const updatedTestimonial = await this.testimonialModel.findByIdAndUpdate(
      testimonialId,
      {
        $set: {
          ...testimonial,
          ...(isNotEmpty(file) ? { photo: galleryUpdated } : {}),
        },
      },
      { new: true, lean: true },
    );

    return updatedTestimonial;
  }
  /**
   * Deletes a testimonial by Id
   *
   * @param user
   * @param testimonialId
   * @returns A promise that resolves to the deleted testimonial
   * @throws ForbiddenException if the user is not a super admin
   * @throws NotFoundException if the testimonial is not found
   */
  async deleteTestimonial(user: User, testimonialId: string) {
    /**
     * Retrieve the exstisting testimonial by its Id
     */
    const testimonialCheck = await this.findSelectedTestimonial(
      user,
      testimonialId,
    );

    /**
     * If the testimonial has an associated photo, remove the image from S3 bucket
     */
    if (isNotEmpty(testimonialCheck.photo))
      await this.removeImageFromTestimonial(
        testimonialId,
        testimonialCheck.photo._id,
      );

    /**
     * remove the testimonial by Id
     */
    const deletedTestimonial = await this.testimonialModel
      .findByIdAndRemove(testimonialId)
      .lean();

    return deletedTestimonial;
  }

  /**
   * Retrieves an image from the S3 bucket
   *
   * @param key
   * @returns Promise that resolve to a readble streamof the image
   */
  async getImage(key: string) {
    /**
     * Reatrieve the image from the specified S3 bucket using the provided key
     */
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  /**
   * Uploads an image to the specified S3 bucket
   *
   * @param buckectName
   * @param folderName
   * @param fileName
   * @param mimetype
   * @param file
   * @returns promise that resolves to the updated testimonial
   * @throws BadRequestException if the testimonial or photo in not found
   */
  async imageUrl(
    buckectName: string,
    folderName: string,
    fileName: string,
    mimetype: string,
    file: Buffer,
  ) {
    /**
     * getting date
     */
    const updatedDate = new Date();

    /**
     * Generate a unique key for the file by appending a timestamp to the file name
     */
    const key = `${folderName}/${updatedDate.getTime()}-${fileName}`;

    const jimpImage = await Jimp.read(file);
    jimpImage.resize(Jimp.AUTO, 100);
    jimpImage.quality(1);
    const base64Image = (await jimpImage.getBase64Async(mimetype)).toString();

    Logger.verbose('Uploading photo for record...', 'Testimonial');

    /**
     * Upload the original file to the S3 bucket
     */
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record image upload successful', 'Testimonial');

        /**
         * Return the details of the uploaded image
         */
        return {
          url: `testimonial/gallery/photo?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          uri: base64Image,
          uploadDate: updatedDate,
        };
      });
  }

  /**
   * Removes an image from a specific testimonial by Id and photo Id
   *
   * @param testimonialId
   * @param photoId
   * @returns promise that resolves to the updated testimonial object
   * @throws BadRequestException if the testimonial or photo is not found
   */
  async removeImageFromTestimonial(testimonialId: string, photoId: string) {
    /**
     * Find the testimonial that cpntains the photo with the photo Id
     * If the testimonial or photo is not found, throw a BadRequestException
     */
    const testimonialCheck = await this.testimonialModel
      .findOne({
        _id: testimonialId,
        'photo._id': photoId,
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new BadRequestException(message.testimonialNotFound);
        }

        return d;
      });

    Logger.verbose('Deleting photo for record...', 'Testimonial');

    /**
     * Delete the photo from the S3 bucket using the file name
     */
    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      testimonialCheck.photo.fileName,
    );

    Logger.verbose('Photo deleted for record', 'Testimonial');

    /**
     * Remove the photo reference from the testimonial
     */
    const updatedTestimonial = await this.testimonialModel.findOneAndUpdate(
      { 'photo._id': photoId },
      { $unset: { photo: { _id: new Types.ObjectId(photoId) } } },
      { new: true, lean: true },
    );

    return updatedTestimonial;
  }
}
