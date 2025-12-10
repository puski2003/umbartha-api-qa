import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import { Model } from 'mongoose';
import { CreateContactI } from './contact.types';
import { isEmpty } from 'class-validator';
import { User } from 'src/config/authorization/user.decorator';
import { ReCaptchaService } from 'src/config/re-captcha/re-captcha.service';
import { SESService } from 'src/config/aws/aws-ses/service';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/schema/notification.schema';

const T = {
  requestNotFound: 'contact request is not found',
  requestAcknowledged: 'contact request is acknowleged',
  requestNotAcknowledged:
    'customer contact request is not ackowleged by anyone. please check it',
};

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<Contact>,
    private readonly reCaptchaService: ReCaptchaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAll(limit: number, page: number) {
    const totalDocs = await this.contactModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const requestsCheck = await this.contactModel
      .find()
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: requestsCheck,
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

  async findSelectedRequest(requestId: string) {
    const requestCheck = await this.contactModel.findById(requestId).lean();

    if (isEmpty(requestCheck)) {
      Logger.error(T.requestNotFound.toUpperCase());
      throw new NotFoundException(T.requestNotFound);
    }
    return requestCheck;
  }

  async createContactRequest(
    query: reCaptchaResponse,
    request: CreateContactI,
  ) {
    await this.reCaptchaService
      .verifyingWithRecaptcha(query.response, query.remoteip)
      .then(async (d) => {
        if (d.success) {
          return d;
        } else {
          Logger.warn('BOT!!!');
          throw new UnprocessableEntityException('BOT DETECTED!!!');
        }
      });

    const createdRequest = await this.contactModel.create(request);

    const contactData = {
      UserName: request.name,
      UserEmail: request.email.toLowerCase(),
      UserPhone: request.phone,
      UserMessage: request.message,
      ContactInformation: 'info@umbartha.org',
      YearOngoing: `${new Date().getFullYear()}`,
    };

    await this.notificationService.sendNotification(
      '66878f9167a4a0f353dde92f',
      NotificationType.EMAIL,
      ['manisha@umbartha.org'],
      'New Contact Request',
      contactData,
    );

    return createdRequest;
  }

  async deleteContactRequest(requestId: string) {
    const requestCheck = await this.findSelectedRequest(requestId);

    if (!requestCheck.acknowledged) {
      Logger.warn(T.requestNotAcknowledged.toUpperCase());
      throw new BadRequestException(T.requestNotAcknowledged);
    }

    const deletedRequest = await this.contactModel
      .findByIdAndRemove(requestId)
      .lean();
    return deletedRequest;
  }

  async requestAcknowledge(user: User, requestId: string) {
    const requestCheck = await this.findSelectedRequest(requestId);

    if (requestCheck.acknowledged) {
      Logger.warn(T.requestAcknowledged.toUpperCase());
      throw new BadRequestException(T.requestAcknowledged);
    }

    const updatedRequest = await this.contactModel.findByIdAndUpdate(
      requestId,
      {
        $set: {
          acknowledged: true,
          acknowledgedBy: user.user,
          acknowledgedDate: new Date(),
        },
      },
      { new: true, lean: true },
    );
    return updatedRequest;
  }
}
