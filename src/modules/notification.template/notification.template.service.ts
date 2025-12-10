import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationTemplate,
  NotificationTemplateType,
} from './schema/notification.template.schema';
import { User } from 'src/config/authorization/user.decorator';
import { PaginatedObjI } from 'src/config/common/types/paginated-object.type';
import { CreateNotificationTemplateI } from './notification.template.types';
import { NOTIFICATION_TEMPLATE_COLLECTION } from './notification.template.constants';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { isEmpty, isNotEmpty } from 'class-validator';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectModel(NOTIFICATION_TEMPLATE_COLLECTION)
    private readonly notificationTemplateModel: Model<NotificationTemplate>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(limit: number = 50, page: number = 1): Promise<PaginatedObjI> {
    /**
     * Count total number of notification template
     */
    const totalDocs = await this.notificationTemplateModel.countDocuments();

    /**
     * Calculate the total number of pages based on limit
     */
    const totalPages = Math.ceil(totalDocs / limit);

    const templateCheck = await this.notificationTemplateModel
      .find()
      .select('-template')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: templateCheck,
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

  async findById(templateId: string) {
    const templateCheck = await this.notificationTemplateModel
      .findById(templateId)
      .lean();

    if (isEmpty(templateCheck))
      throw new BadRequestException('template in not found');

    return templateCheck;
  }

  async createTemplate(
    user: User,
    template: CreateNotificationTemplateI,
    file: Express.Multer.File,
  ) {
    /**
     * If user is not super admin, throw a ForbuddenException
     */
    if (!user.isSuperAdmin && !user.isAdmin)
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );

    if (
      template.type === NotificationTemplateType.EMAIL &&
      file.mimetype !== 'text/html'
    )
      throw new BadRequestException('template should be a html file');
    else if (
      template.type === NotificationTemplateType.SMS &&
      file.mimetype !== 'text/plain'
    )
      throw new BadRequestException('template schoudl be a text file');

    const templateUpdated = await this.templateUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `notification-template/file`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    return await this.notificationTemplateModel.create({
      ...template,
      template: templateUpdated,
    });
  }

  /**
   * Updates a notification template with a new file
   *
   * @param user
   * @param templateId
   * @param file
   * @throws if the user not have sufficiant permission, throw new ForbiddenException
   * @throws if the file type does not match the template type, throw new BadRequestException
   * @returns the updated notification template
   */
  async updateTemplate(
    user: User,
    templateId: string,
    file: Express.Multer.File,
  ) {
    /**
     * If user is not super admin, throw a ForbuddenException
     */
    if (!user.isSuperAdmin && !user.isAdmin)
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );

    /**
     * Retrieve the existing template by Id
     */
    const templateCheck = await this.findById(templateId);

    /**
     * Validate the file type based on the tempate type
     */
    if (
      templateCheck.type === NotificationTemplateType.EMAIL &&
      file.mimetype !== 'text/html'
    )
      throw new BadRequestException('template should be a html file');
    else if (
      templateCheck.type === NotificationTemplateType.SMS &&
      file.mimetype !== 'text/plain'
    )
      throw new BadRequestException('template schoudl be a text file');

    /**
     * If the template already has an associated file, remove it
     */
    if (isNotEmpty(templateCheck.template)) {
      await this.removeFileFromTemplate(templateId, templateCheck.template._id);

      await this.notificationTemplateModel.findByIdAndUpdate(
        templateId,
        {
          $unset: {
            'template._id': new Types.ObjectId(templateCheck.template._id),
          },
        },
        { new: true, lean: true },
      );
    }

    /**
     * Upload the new template file to S3
     */
    const templateUpdated = await this.templateUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `notification-template/file`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    /**
     * Update the template in the db with the new template file
     */
    return await this.notificationTemplateModel.findByIdAndUpdate(
      templateId,
      { template: templateUpdated },
      { new: true, lean: true },
    );
  }

  /**
   * Deletes a template by Id
   *
   * @param user
   * @param templateId
   * @returns A promise that resolves to the deleted template
   * @throws ForbiddenException if the user is not a super admin
   * @throws NotFoundException if the template is not found
   */
  async deleteTestimonial(templateId: string) {
    /**
     * Retrieve the exstisting template by its Id
     */
    const testimonialCheck = await this.notificationTemplateModel.findById(
      templateId,
    );

    /**
     * If the template has an associated photo, remove the image from S3 bucket
     */
    if (isNotEmpty(testimonialCheck.template))
      await this.removeFileFromTemplate(
        templateId,
        testimonialCheck.template._id,
      );

    /**
     * remove the template by Id
     */
    const deletedTestimonial = await this.notificationTemplateModel
      .findByIdAndRemove(templateId)
      .lean();

    return deletedTestimonial;
  }

  /**
   * Retrieves an image from the S3 bucket
   *
   * @param key
   * @returns Promise that resolve to a readble streamof the image
   */
  async getTemplate(key: string) {
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
   * @returns promise that resolves to the updated template
   * @throws BadRequestException if the template or photo in not found
   */
  async templateUrl(
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

    Logger.verbose('Uploading template for record...', 'NotificationTemplate');

    /**
     * Upload the original file to the S3 bucket
     */
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose(
          'Record template upload successful',
          'NotificationTemplate',
        );

        /**
         * Return the details of the uploaded image
         */
        return {
          url: `notification-template/template/file?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          templateData: file.toString(),
          uploadDate: updatedDate,
        };
      });
  }

  /**
   * Removes an image from a specific template by Id and file Id
   *
   * @param templateId
   * @param fileId
   * @returns promise that resolves to the updated template object
   * @throws BadRequestException if the template or photo is not found
   */
  async removeFileFromTemplate(templateId: string, fileId: string) {
    /**
     * Find the template that cpntains the photo with the photo Id
     * If the template or photo is not found, throw a BadRequestException
     */
    const templateCheck = await this.notificationTemplateModel
      .findOne({
        _id: templateId,
        'template._id': fileId,
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new BadRequestException('template is not found');
        }

        return d;
      });

    Logger.verbose('Deleting template for record...', 'NotificationTemplate');

    /**
     * Delete the photo from the S3 bucket using the file name
     */
    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      templateCheck.template.fileName,
    );

    Logger.verbose('Template deleted for record', 'NotificationTemplate');

    /**
     * Remove the photo reference from the testimonial
     */
    const updatedTemplate =
      await this.notificationTemplateModel.findOneAndUpdate(
        { 'template._id': fileId },
        { $unset: { template: { _id: new Types.ObjectId(fileId) } } },
        { new: true, lean: true },
      );

    return updatedTemplate;
  }
}
