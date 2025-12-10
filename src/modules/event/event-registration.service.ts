import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  CreateEventRegistrationI,
  EmailVerifyI,
  EventRegistrationI,
  UpdateEventRegistrationI,
} from './event-registration.types';
import { EVENT_COLLECTION, EVENT_REGIST_COLLECTION } from './event.constants';
import {
  DateRangeFilter,
  EventRegistration,
} from './schema/event-registration.schema';
import { isEmpty } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { EventService } from './event.service';
import { SUBSCRIPTION_COLLECTION } from '../subscription/subscription.constants';
import {
  Status,
  Subscription,
} from '../subscription/schema/subscription.schema';
import { ServiceService } from '../service/service.service';
import { SMSService } from 'src/config/sms/sms.service';
import { formatInTimeZone } from 'date-fns-tz';
import { NotificationType } from '../notification/schema/notification.schema';
import { NotificationService } from '../notification/notification.service';
import { EventRegistrationFilterI } from './event.types';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

const T = {
  registrationNotFound: 'event registration is not found',
  otpVerificationFail: 'OTP verification fail',
};

@Injectable()
export class EventRegistrationService {
  constructor(
    @InjectModel(EVENT_REGIST_COLLECTION)
    private readonly eventRegistrationModel: Model<EventRegistration>,
    private readonly eventService: EventService,
    private readonly smsService: SMSService,
    private readonly jwtService: JwtService,
    @InjectModel(SUBSCRIPTION_COLLECTION)
    private readonly subscriptionModel: Model<Subscription>,
    private readonly serviceService: ServiceService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(limit: number, page: number, filter: EventRegistrationFilterI) {
    const pipeline: PipelineStage[] = [];

    const servicesCheck = await this.serviceService.findAll(null, null);

    const servicesIds = [];
    for (const service of servicesCheck.docs) {
      servicesIds.push(new Types.ObjectId(service._id));
    }

    pipeline.push({
      $match: {
        _eventId: { $nin: servicesIds },
      },
    });

    pipeline.push(
      {
        $lookup: {
          from: 'events',
          localField: '_eventId',
          foreignField: '_id',
          as: '_eventId',
        },
      },
      {
        $unwind: {
          path: '$_eventId',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (filter.firstName)
      pipeline.push({
        $match: {
          firstName: { $regex: filter.firstName, $options: 'i' },
        },
      });

    if (filter.lastName)
      pipeline.push({
        $match: {
          lastName: { $regex: filter.lastName, $options: 'i' },
        },
      });

    if (filter.eventTitle) {
      pipeline.push({
        $match: {
          '_eventId.title': { $regex: filter.eventTitle, $options: 'i' },
        },
      });
    }

    if (filter.serviceName) {
      pipeline.push({
        $match: {
          '_eventId.name': { $regex: filter.serviceName, $options: 'i' },
        },
      });
    }

    if (filter.date && filter.date !== DateRangeFilter.ALL) {
      if (filter.date === DateRangeFilter.TODAY) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfDay(today),
              $lt: endOfDay(today),
            },
          },
        });
      }

      if (filter.date === DateRangeFilter.WEEK) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfWeek(today),
              $lt: endOfWeek(today),
            },
          },
        });
      }

      if (filter.date === DateRangeFilter.MONTH) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfMonth(today),
              $lt: endOfMonth(today),
            },
          },
        });
      }
    }

    if (filter.dateFrom || filter.dateTo) {
      pipeline.push({
        $match: {
          createdAt: {
            ...(filter.dateFrom ? { $gte: new Date(filter.dateFrom) } : {}),
            ...(filter.dateTo ? { $lt: new Date(filter.dateTo) } : {}),
          },
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'totalDocs' }],
        data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
      },
    });

    const [result] = await this.eventRegistrationModel.aggregate(pipeline);
    const totalDocs = result.metadata[0]?.totalDocs || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    const registrationsCheck = result.data;

    return {
      docs: registrationsCheck,
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

  async findSelectedRegistration(
    registrationId: string,
  ): Promise<EventRegistration> {
    const registrationCheck = await this.eventRegistrationModel
      .findById(registrationId)
      .lean()
      .populate({ path: '_eventId' });

    if (isEmpty(registrationCheck)) {
      Logger.debug(T.registrationNotFound.toUpperCase());
      throw new NotFoundException(T.registrationNotFound);
    }
    return registrationCheck;
  }

  async createRegistration(registration: EventRegistrationI) {
    await this.eventService.findSelectedEvent(registration._eventId);

    const createdRegistration = (
      await this.eventRegistrationModel.create({
        ...registration,
        emailVerified: false,
        phoneVerified: false,
        _eventId: new Types.ObjectId(registration._eventId),
      })
    )
      .populate('_eventId')
      .then(async (d) => {
        await this.subscriptionModel.create({
          email: registration.email,
          type: 'EVENT',
          updatedBy: 'Client',
          status: Status.SUBSCRIBED,
        });

        return d;
      });

    return createdRegistration;
  }

  async updateSelectedRegistration(
    registrationId: string,
    registration: UpdateEventRegistrationI,
  ): Promise<EventRegistration> {
    await this.findSelectedRegistration(registrationId);

    const updatedRegistration = await this.eventRegistrationModel
      .findByIdAndUpdate(
        registrationId,
        {
          $set: {
            ...(registration.email
              ? { email: registration.email, emailVerified: true }
              : {}),
            ...(registration.phone
              ? { phone: registration.phone, phoneVerified: true }
              : {}),
          },
        },
        { new: true, lean: true },
      )
      .lean();

    return updatedRegistration;
  }

  async deleteRegistration(registrationId: string): Promise<EventRegistration> {
    await this.findSelectedRegistration(registrationId);

    const deletedRegistration = await this.eventRegistrationModel
      .findByIdAndDelete(registrationId)
      .lean();
    return deletedRegistration;
  }

  async registrationOTPSend(phone: string) {
    const otpSendRes = await this.smsService.sendOtp(phone);
    return otpSendRes;
  }

  async registrationOTPVerify(registration: CreateEventRegistrationI) {
    const createdRegistration = await this.eventRegistrationModel
      .findOne({
        _eventId: registration._eventId,
        phone: registration.phone,
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          return await this.createRegistration({
            phone: registration.phone,
            ...registration,
          });
        }

        return await this.eventRegistrationModel
          .findByIdAndUpdate(
            d._id,
            {
              $set: {
                firstName: registration.firstName,
                lastName: registration.lastName,
                phone: registration.phone,
                phoneVerified: true,
                email: registration.email,
              },
            },
            { new: true, lean: true },
          )
          .populate('_eventId');
      });

    let registrationData;
    if (createdRegistration._eventId.type === 'SERVICE') {
      registrationData = {
        ParticipantName: `${
          registration.firstName[0].toUpperCase() +
          registration.firstName.slice(1).toLowerCase()
        } ${
          registration.lastName[0].toUpperCase() +
          registration.lastName.slice(1).toLowerCase()
        }`,
        SpecialInstruction: createdRegistration._eventId.specialInstruction,
        ServiceName: createdRegistration._eventId.name,
        ContactEmail: 'manisha@umbartha.org',
        ContactPhone: '+94 76 416 4972',
        ContactInformation: 'info@umbartha.org',
        YearOngoing: `${new Date().getFullYear()}`,
      };

      await this.notificationService
        .sendNotification(
          '66878fe767a4a0f353dde943',
          NotificationType.EMAIL,
          [registration.email],
          'Service Registration',
          registrationData,
        )
        .catch((e) => {
          console.log('e: ', e);
        });
    } else {
      registrationData = {
        ParticipantName: `${
          registration.firstName[0].toUpperCase() +
          registration.firstName.slice(1).toLowerCase()
        } ${
          registration.lastName[0].toUpperCase() +
          registration.lastName.slice(1).toLowerCase()
        }`,
        EventName: createdRegistration._eventId.title,
        EventDate: `${formatInTimeZone(
          new Date(createdRegistration._eventId.dates?.[0]?.dateFrom),
          registration.timeZone,
          'dd MMM yyyy',
        )}`,
        EventTime: `${formatInTimeZone(
          new Date(createdRegistration._eventId.timings?.[0]?.from),
          registration.timeZone,
          'hh:mm aaaa',
        )}`,
        EventLocationLink:
          createdRegistration._eventId.location.link.toString(),
        EventLocationName:
          createdRegistration._eventId.location.name.toString(),
        ContactEmail: 'manisha@umbartha.org',
        ContactPhone: '+94 76 416 4972',
        ContactInformation: 'info@umbartha.org',
        YearOngoing: `${new Date().getFullYear()}`,
      };

      await this.notificationService
        .sendNotification(
          '66878fbc67a4a0f353dde939',
          NotificationType.EMAIL,
          [registration.email],
          'Event Registration',
          registrationData,
        )
        .catch((e) => {
          console.log('e: ', e);
        });
    }

    return createdRegistration;
  }

  async registrationEmailVerifyLink(registrationId: string, email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: '240s',
    });

    const url = `${
      process.env.ADMIN_API_URL
    }/event-registration/${registrationId}/email/email-verify?date=${new Date().getTime()}&token=${token}&expires=24h`;
    return url;
  }

  async registrationEmailVerify(registrationId: string, query: EmailVerifyI) {
    let email: string;
    try {
      const payload = await this.jwtService.verify(query.token, {
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        email = payload.email;
      }
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }

    const updatedRegistration = await this.eventRegistrationModel
      .findOne({ _id: registrationId, email: email })
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.error(T.registrationNotFound.toUpperCase());
          throw new BadRequestException(T.registrationNotFound);
        }

        return await this.eventRegistrationModel
          .findByIdAndUpdate(
            registrationId,
            {
              $set: { email: email, emailVerified: true },
            },
            { new: true, lean: true },
          )
          .lean();
      });

    return updatedRegistration;
  }

  async getServiceRegistation(
    limit: number,
    page: number,
    filter: EventRegistrationFilterI,
  ) {
    const pipeline: PipelineStage[] = [];

    const servicesCheck = await this.serviceService.findAll(null, null);

    const servicesIds = [];
    for (const service of servicesCheck.docs) {
      servicesIds.push(new Types.ObjectId(service._id));
    }

    pipeline.push({
      $match: {
        _eventId: { $in: servicesIds },
      },
    });

    pipeline.push(
      {
        $lookup: {
          from: 'events',
          localField: '_eventId',
          foreignField: '_id',
          as: '_eventId',
        },
      },
      {
        $unwind: {
          path: '$_eventId',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (filter.firstName)
      pipeline.push({
        $match: {
          firstName: { $regex: filter.firstName, $options: 'i' },
        },
      });

    if (filter.lastName)
      pipeline.push({
        $match: {
          lastName: { $regex: filter.lastName, $options: 'i' },
        },
      });

    if (filter.eventTitle) {
      pipeline.push({
        $match: {
          '_eventId.title': { $regex: filter.eventTitle, $options: 'i' },
        },
      });
    }

    if (filter.serviceName) {
      pipeline.push({
        $match: {
          '_eventId.name': { $regex: filter.serviceName, $options: 'i' },
        },
      });
    }

    if (filter.date && filter.date !== DateRangeFilter.ALL) {
      if (filter.date === DateRangeFilter.TODAY) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfDay(today),
              $lt: endOfDay(today),
            },
          },
        });
      }

      if (filter.date === DateRangeFilter.WEEK) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfWeek(today),
              $lt: endOfWeek(today),
            },
          },
        });
      }

      if (filter.date === DateRangeFilter.MONTH) {
        const today = new Date();

        pipeline.push({
          $match: {
            createdAt: {
              $gte: startOfMonth(today),
              $lt: endOfMonth(today),
            },
          },
        });
      }
    }

    if (filter.dateFrom || filter.dateTo) {
      pipeline.push({
        $match: {
          createdAt: {
            ...(filter.dateFrom ? { $gte: new Date(filter.dateFrom) } : {}),
            ...(filter.dateTo ? { $lt: new Date(filter.dateTo) } : {}),
          },
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'totalDocs' }],
        data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
      },
    });

    const [result] = await this.eventRegistrationModel.aggregate(pipeline);
    const totalDocs = result.metadata[0]?.totalDocs || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    const registrationsCheck = result.data;

    return {
      docs: registrationsCheck,
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
