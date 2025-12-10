import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PAYIT_FORWARD_COLLECTION } from './payit-forward.constants';
import { Model, Types } from 'mongoose';
import { PayitForward } from './schema/payit-forward.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { CreatePayitForwardI } from './payit-forward.types';
import { Readable } from 'stream';
import { SESService } from 'src/config/aws/aws-ses/service';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PayitForwardService {
  constructor(
    @InjectModel(PAYIT_FORWARD_COLLECTION)
    private readonly payitForwardModel: Model<PayitForward>,
    private readonly s3Service: S3Service,
    private readonly sesService: SESService,
  ) {}

  async findAll(limit: number, page: number) {
    const totalDocs = await this.payitForwardModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const payitForwardsCheck = await this.payitForwardModel
      .find()
      .populate('_serviceId')
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: payitForwardsCheck,
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

  async findSelectedPayitForward(
    payitForwardId: string,
  ): Promise<PayitForward> {
    const payitForwardCheck = await this.payitForwardModel
      .findById(payitForwardId)
      .populate('_serviceId')
      .lean();

    if (isEmpty(payitForwardCheck)) {
      Logger.warn('payit forward is not found', 'PayitForward');
      throw new BadRequestException('payit forward is not found');
    }

    return payitForwardCheck;
  }

  async createPayitForward(
    payitForward: CreatePayitForwardI,
    file: Express.Multer.File,
  ) {
    let attachmentUpdated;
    if (isNotEmpty(file)) {
      attachmentUpdated = await this.imageUrl(
        process.env.S3_UMBARTHA_BUCKET_NAME,
        `payit-forward/attachment`,
        file.originalname,
        file.mimetype,
        file.buffer,
      );
    }

    const createdPayitForward = await this.payitForwardModel.create({
      ...payitForward,
      _serviceId: new Types.ObjectId(payitForward._serviceId),
      attachment: attachmentUpdated,
    });

    const source = fs.readFileSync(
      path.join(
        __dirname,
        '../notification.template/templates.files/payitForwardThanking.html',
      ),
    );

    const payitForwardThankingTemplate = Handlebars.compile(source.toString());

    const payitForwardData = {
      DonorName: `${
        payitForward.firstName[0].toUpperCase() +
        payitForward.firstName.slice(1).toLowerCase()
      } ${
        payitForward.lastName[0].toUpperCase() +
        payitForward.lastName.slice(1).toLowerCase()
      }`,
      ContactInformation: 'info@umbartha.org',
      YearOngoing: `${new Date().getFullYear()}`,
    };

    const payitForwardMail = {
      toAddresses: [payitForward.email],
      htmlData: payitForwardThankingTemplate(payitForwardData).toString(),
      subject: 'Payit Forward Thanking',
    };

    Logger.verbose('Sending email for payit forward...', 'PayitForward');
    await this.sesService.sendEmail(payitForwardMail);
    Logger.verbose('Email sent successfully', 'PayitForward');

    return createdPayitForward;
  }

  async acknowledgePayitForward(payitForwardId: string): Promise<PayitForward> {
    const payitForwardCheck = await this.findSelectedPayitForward(
      payitForwardId,
    );

    const updatedPayitForward = await this.payitForwardModel.findByIdAndUpdate(
      payitForwardId,
      {
        ...(payitForwardCheck.acknowledged
          ? { acknowledged: false }
          : { acknowledged: true }),
      },
      { new: true, lean: true },
    );
    return updatedPayitForward;
  }

  async deletePayitForward(payitForwardId: string) {
    await this.findSelectedPayitForward(payitForwardId).then(async (d) => {
      await this.removeFileFromS3(d.attachment?.fileName);
    });

    const deletedPayitForward = await this.payitForwardModel.findByIdAndDelete(
      payitForwardId,
    );
    return deletedPayitForward;
  }

  async getFile(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async imageUrl(
    buckectName: string,
    folderName: string,
    fileName: string,
    mimetype: string,
    file: Buffer,
  ) {
    const key = `${folderName}/${new Date().getTime()}-${fileName}`;

    Logger.verbose('Uploading file for record...', 'PayitForward');
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record file upload successful', 'PayitForward');
        return {
          url: `payit-forward/attachment/file?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
          mimetype: mimetype,
        };
      });
  }

  async removeFileFromS3(fileName: string) {
    Logger.verbose('Deleting file for record...', 'PayitForward');

    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      fileName,
    );

    Logger.verbose('File deleted for record', 'PayitForward');
  }
}
