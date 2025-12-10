import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './schemas/client.schema';
import { Model, Types } from 'mongoose';
import {
  CreateClientI,
  CreateIntakeFormI,
  UpdateClientI,
  emailVerifyI,
} from './client.types';
import { isEmpty, isNotEmpty } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { CLIENT_COLLECTION } from './client.constants';
import { DataFormService } from '../data-form/data-form.service';
import { User } from 'src/config/authorization/user.decorator';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBooking } from '../meeting.booking/schema/meeting.booking.schema';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';

const T = {
  clientNotFound: 'client is not found',
  alreadyPhoneValidated: 'client phone number already validated',
  alreadyEmailValidated: 'client email address already validated',
  alreadyHaveClient: 'client phone number already exists',
};

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(CLIENT_COLLECTION) private readonly clientModel: Model<Client>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorMode: Model<Counsellor>,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
    private readonly dataFormModel: DataFormService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(search: string, limit = 50, page = 1, user: User) {
    const filter: any = {};
    if (
      !user.isSuperAdmin &&
      !user.isAdmin &&
      user.isCounsellor &&
      isNotEmpty(user.counsellor)
    ) {
      const counsellorId = new Types.ObjectId(user.counsellor);

      const meetingBookingCheck = await this.meetingBookingModel
        .find({
          counsellor: new Types.ObjectId(counsellorId),
        })
        .lean();
      const counsellorClients: Types.ObjectId[] = [];
      for (const meetingBooking of meetingBookingCheck)
        if (meetingBooking?.client?._id)
          counsellorClients.push(new Types.ObjectId(meetingBooking.client._id));

      filter._id = { $in: counsellorClients };
    }

    if (isNotEmpty(search)) {
      /**
       * Split the search string
       */
      const parts = search.split(':');

      /**
       * Extract the last part as the value
       */
      const value = parts.pop();
      console.log('value: ', value);

      /**
       * Construct the key path for the filter without the last part
       */
      const keyPath = parts.join('.');

      /**
       * Escape special characters in the value for use in regex
       */
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter[keyPath] = { $regex: escapedValue, $options: 'i' };
    }

    const totalDocs = await this.clientModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const clientCheck = await this.clientModel
      .find(filter)
      .populate([
        {
          path: 'intakeForm.form',
          select: 'type title description counsellor',
        },
      ])
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: clientCheck,
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

  async findSelectedClient(clientId: string): Promise<Client> {
    const clientCheck = await this.clientModel
      .findById(clientId)
      .lean()
      .populate([
        {
          path: 'intakeForm.form',
          select: 'type title description counsellor target',
          populate: {
            path: 'counsellor',
            select: 'title profilePictureURL gender displayName email mobile',
          },
        },
      ]);

    if (isEmpty(clientCheck)) {
      throw new NotFoundException(T.clientNotFound);
    }

    return clientCheck;
  }

  async findClientUseEmail(email: string): Promise<Client> {
    const clientCheck = await this.clientModel
      .findOne({
        email: email,
      })
      .lean()
      .populate([
        {
          path: 'intakeForm.form',
          select: 'type title description counsellor',
        },
      ]);

    if (isEmpty(clientCheck)) {
      throw new BadRequestException(T.clientNotFound);
    }

    return clientCheck;
  }

  async createClient(client: CreateClientI): Promise<Client> {
    const updatedClient = await this.clientModel.findOneAndUpdate(
      { phone: client.phone },
      { $set: { ...client, phoneVerified: true, emailVerified: true } },
      { new: true, lean: true, upsert: true },
    );

    return updatedClient;
  }

  async updateSelectedClient(
    clientId: string,
    client: UpdateClientI,
  ): Promise<Client> {
    await this.findSelectedClient(clientId);

    const updatedClient = await this.clientModel
      .findByIdAndUpdate(
        clientId,
        {
          $set: {
            ...client,
            ...(client.phone ? { phoneVerified: true } : {}),
            ...(client.email ? { emailVerified: true } : {}),
          },
        },
        { new: true, lean: true },
      )
      .lean();

    return updatedClient;
  }

  async deleteSelectClient(clientId: string): Promise<Client> {
    await this.findSelectedClient(clientId);

    const deletedClient = await this.clientModel
      .findByIdAndDelete(clientId)
      .lean();
    return deletedClient;
  }

  async findIntakeForm(clientId: string, intakeFormId: string) {
    const intakeFormCheck = await this.clientModel
      .findOne(
        {
          _id: clientId,
          intakeForm: { $elemMatch: { _id: new Types.ObjectId(intakeFormId) } },
        },
        { 'intakeForm.$': 1 },
      )
      .populate([
        {
          path: 'intakeForm.form',
          select: 'type title description counsellor',
        },
      ]);

    if (isEmpty(intakeFormCheck)) {
      throw new NotFoundException('added client intake form is not found');
    }
    return intakeFormCheck;
  }

  async addIntakeFormToClient(clientId: string, intakeForm: CreateIntakeFormI) {
    await this.findSelectedClient(clientId);
    await this.dataFormModel.findSelectedDataForm(intakeForm.form);

    const updatedClient = await this.clientModel.findByIdAndUpdate(
      clientId,
      {
        $push: {
          intakeForm: [
            {
              date: new Date(),
              form: new Types.ObjectId(intakeForm.form),
              formData: intakeForm.formData,
            },
          ],
        },
      },
      { new: true, lean: true },
    );

    return updatedClient;
  }

  async removeIntakeFormFromClient(
    clientId: string,
    intakeFormId: string,
  ): Promise<Client> {
    await this.findIntakeForm(clientId, intakeFormId);

    const updatedClient = await this.clientModel.findOneAndUpdate(
      { _id: clientId, 'intakeForm._id': intakeFormId },
      { $pull: { intakeForm: { _id: intakeFormId } } },
      { new: true, lean: true },
    );

    return updatedClient;
  }

  async clientEmailVerifyLink(clientId: string, email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: '24h',
    });

    const url = `${
      process.env.ADMIN_API_URL
    }/client/${clientId}/email/email-verify?date=${new Date().getTime()}&token=${token}&expires=24h`;
    return url;
  }

  async clientEmailVerify(clientId: string, query: emailVerifyI) {
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

    const updatedClient = await this.clientModel
      .findOne({ _id: clientId, email: email })
      .lean()
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new BadRequestException(T.clientNotFound);
        }

        return await this.clientModel
          .findByIdAndUpdate(
            clientId,
            {
              $set: { email: email, emailVerified: true },
            },
            { new: true, lean: true },
          )
          .lean();
      });

    return updatedClient;
  }
}
