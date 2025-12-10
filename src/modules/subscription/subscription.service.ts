import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status, Subscription } from './schema/subscription.schema';
import { CreateSubscriptionI } from './subscription.types';
import { isEmpty, isNotEmpty } from 'class-validator';
import { SUBSCRIPTION_COLLECTION } from './subscription.constants';
import { User } from 'src/config/authorization/user.decorator';
import { ReCaptchaService } from 'src/config/re-captcha/re-captcha.service';
import { reCaptchaResponse } from 'src/config/re-captcha/dto/re-captcha.dto';
import { NotificationService } from '../notification/notification.service';
import { formatInTimeZone } from 'date-fns-tz';
import { PaginatedObjI } from 'src/config/common/types/paginated-object.type';
import { NotificationType } from '../notification/schema/notification.schema';

/**
 *
 * @author Seshan Kavisanka
 * @since 1.0.0
 * @version 1.0.0
 */

/** Error messages */
const T = {
  subscriptionNotFound: 'subscription is not found',
};

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(SUBSCRIPTION_COLLECTION)
    private readonly subscriptionModel: Model<Subscription>,
    private readonly notificationService: NotificationService,
    private readonly reCaptchaService: ReCaptchaService,
  ) {}

  /**
   * Finds all Subscription based on the provided limit, page and status
   *
   * @param {number} limit - The maxium number of subscriptions to return
   * @param {number} page - The page number to retrieve
   * @param {string} status - The status filter for the subscriptions
   * @returns - A promise the resolves to an array of subscriptions matching the criteria
   */
  async findAllSubscription(
    search: string,
    limit = 50,
    page = 1,
    status: string,
  ): Promise<PaginatedObjI> {
    const filter = {
      ...(isNotEmpty(status) ? { status: status } : {}),
      ...(isNotEmpty(search)
        ? (() => {
            const [field, value] = search.split(':');
            return {
              [field]: { $regex: value, $options: 'i' },
            };
          })()
        : {}),
    };

    /** Get count of subscriptions */
    const totalDocs = await this.subscriptionModel.countDocuments(filter);

    /** Get total number of page based on limit */
    const totalPages = Math.ceil(totalDocs / limit);

    /** Fetch all subscription with pagination and optional status filtering */
    const findAll = await this.subscriptionModel
      .find(filter)
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    // Return the found subcription
    return {
      docs: findAll,
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
   * Finds a specific subscription based on the provided subscription ID
   *
   * @param {string} subscriptionId - The unique identifier of the subcription to retrieve
   * @returns - A Promise that resolves to the subscription object id found
   * @throws {NotFoundException} - Id the subcription is not found
   */
  async findSelectedSubscription(
    subscriptionId: string,
  ): Promise<Subscription> {
    // Find the subcription by its ID
    const subscriptionCheck = await this.subscriptionModel
      .findById(subscriptionId)
      .lean();

    // Check if the subcription is found
    if (isEmpty(subscriptionCheck)) {
      // Throw a NotFoundException if the subcription is not found
      throw new NotFoundException(T.subscriptionNotFound);
    }

    // Return the found subcription
    return subscriptionCheck;
  }

  /**
   *
   * @param subscription Creates a new Subcription
   * @returns - A prmise that resolves to the newly created subcription
   */
  async createSubscribe(
    query: reCaptchaResponse,
    subscription: CreateSubscriptionI,
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

    const subscriptionCheck = await this.subscriptionModel
      .findOne({
        email: subscription.email.toLocaleUpperCase(),
      })
      .lean();

    const subcriptionData = {
      SubscriberEmail: subscription.email.toLowerCase(),
      SubscriptionDate: formatInTimeZone(
        new Date(),
        subscription.timeZone,
        'dd MMM yyyy',
      ),
      ContactInformation: 'info@umbartha.org',
      YearOngoing: `${new Date().getFullYear()}`,
    };

    await this.notificationService.sendNotification(
      '6687907467a4a0f353dde95c',
      NotificationType.EMAIL,
      [subscription.email],
      'Subscription Confirmation',
      subcriptionData,
    );

    return await this.subscriptionModel.findOneAndUpdate(
      { email: subscription.email.toLowerCase() },
      {
        ...subscription,
        ...subscriptionCheck,
        status: Status.SUBSCRIBED,
        updatedBy: 'Client',
      },
      { new: true, lean: true, upsert: true },
    );
  }

  async deleteSelectedSubscription(subscriptionId: string) {
    await this.findSelectedSubscription(subscriptionId);

    return await this.subscriptionModel
      .findByIdAndRemove(subscriptionId)
      .lean();
  }

  async changeStatus(user: User, subscriptionId: string, timeZone: string) {
    const subscriptionCheck = await this.findSelectedSubscription(
      subscriptionId,
    );

    const subcriptionData = {
      SubscriberEmail: subscriptionCheck.email.toLowerCase(),
      SubscriptionDate: formatInTimeZone(new Date(), timeZone, 'dd MMM yyyy'),
      ContactInformation: 'info@umbartha.org',
      YearOngoing: formatInTimeZone(new Date(), timeZone, 'yyyy'),
    };

    if (subscriptionCheck.status === Status.UNSUBSCRIBED)
      await this.notificationService.sendNotification(
        '6687907467a4a0f353dde95c',
        NotificationType.EMAIL,
        [subscriptionCheck.email],
        'Subscription Confirmation',
        subcriptionData,
      );

    const updatedSubscription = await this.subscriptionModel
      .findByIdAndUpdate(
        subscriptionId,
        {
          $set: {
            status:
              subscriptionCheck.status === Status.SUBSCRIBED
                ? Status.UNSUBSCRIBED
                : Status.SUBSCRIBED,
            updatedBy: user.user,
          },
        },
        { new: true, lean: true },
      )
      .lean();

    return updatedSubscription;
  }
}
