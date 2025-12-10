import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/config/authorization/user.decorator';
import { ServiceService } from '../service/service.service';
import {
  CreateCounsellorI,
  UpdateCounsellorI,
  ChangeStatusI,
  CounsellorQueryI,
} from './counsellor.types';
import { Counsellor } from './schemas/counsellor.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { COUNSELLOR_COLLECTION } from './counsellor.constants';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import {
  MeetingBooking,
  MeetingBookingStatus,
} from '../meeting.booking/schema/meeting.booking.schema';
import { startOfToday, startOfTomorrow } from 'date-fns';

const T = {
  counsellorNotFound: 'counsellor is not found',
};

@Injectable()
export class CounsellorService {
  constructor(
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    private readonly serviceService: ServiceService,
    private readonly s3Service: S3Service,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
  ) {}

  async findAll(
    user: User,
    limit: number,
    page: number,
    query?: CounsellorQueryI,
  ) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin && !user.isStaffManager) {
      filter.userId = user.user;
    }

    if (query?.publishAppointments) {
      filter.publishAppointments = query?.publishAppointments;
    }

    const totalDocs = await this.counsellorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const counsellorsCheck = await this.counsellorModel
      .find(filter)
      .populate([{ path: 'services', select: 'name title' }])
      .sort({ index: 1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: counsellorsCheck,
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

  async findSelectedCounsellor(counsellorId: string) {
    const counsellorCheck = await this.counsellorModel
      .findById(counsellorId)
      .populate([{ path: 'services', select: 'name title' }])
      .lean();

    if (isEmpty(counsellorCheck)) {
      Logger.debug(T.counsellorNotFound);
      throw new NotFoundException(T.counsellorNotFound);
    }

    return counsellorCheck;
  }

  async findByEmail(email: string) {
    return await this.counsellorModel
      .findOne({ email: email }, { displayName: 1, userId: 1, email: 1 })
      .lean();
  }

  async createCounsellor(
    user: User,
    counsellor: CreateCounsellorI,
  ): Promise<Counsellor> {
    const counsellorIndex = await this.counsellorModel.find().countDocuments();
    if (counsellor.index > counsellorIndex + 1) {
      throw new BadRequestException(
        'Invalid index; the number you entered exceeds the number of counsellors in the list',
      );
    }

    const counsellorDisplayName =
      counsellor.firstName + ' ' + counsellor.lastName;

    const createdCounsellor = this.counsellorModel.create({
      ...counsellor,
      createdBy: user.user,
      userId: '',
      displayName: counsellorDisplayName,
    });

    this.counsellorIndexUpdate();

    return createdCounsellor;
  }

  async updateCounsellor(
    counsellorId: string,
    counsellor: UpdateCounsellorI,
  ): Promise<Counsellor> {
    const counsellorCheck = await this.findSelectedCounsellor(counsellorId);

    let displayName: string;
    if (isNotEmpty(counsellor.firstName) || isNotEmpty(counsellor.lastName)) {
      displayName = counsellor.firstName + ' ' + counsellor.lastName;
    }

    const updatedCounsellor = await this.counsellorModel.findByIdAndUpdate(
      { _id: counsellorId },
      {
        $set: {
          ...counsellor,
          displayName: isNotEmpty(displayName)
            ? displayName
            : counsellorCheck.displayName,
        },
      },
      { new: true, lean: true },
    );

    return updatedCounsellor;
  }

  async deleteCounsellor(counsellorId: string): Promise<Counsellor> {
    await this.findSelectedCounsellor(counsellorId);

    const deletedCounsellor = await this.counsellorModel
      .findByIdAndDelete(counsellorId)
      .lean();
    return deletedCounsellor;
  }

  async getProfilePic(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async addProfilePicToCounsellor(
    counsellorId: string,
    file: Express.Multer.File,
  ) {
    const counsellorCheck = await this.findSelectedCounsellor(counsellorId);
    if (isNotEmpty(counsellorCheck.profilePictureURL)) {
      await this.removeProfilePicFromCounsellor(
        counsellorId,
        counsellorCheck.profilePicture._id,
      );
    }

    const galleryUpdated = await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `counsellor/profile`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    const updatedTestimonial = await this.counsellorModel.findByIdAndUpdate(
      counsellorId,
      {
        $set: {
          profilePictureURL: galleryUpdated.s3ObjectURL,
          profilePicture: { _id: new Types.ObjectId(), ...galleryUpdated },
        },
      },
      { new: true, lean: true },
    );

    return updatedTestimonial;
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

    Logger.verbose('Uploading photo for record...', 'Testimonial');
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record image upload successful', 'Testimonial');
        return {
          s3ObjectURL: `counsellor/profile/profile-picture?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          name: key,
          uri: `data:image/webp;base64,${base64Image}`,
        };
      });
  }

  async removeProfilePicFromCounsellor(
    counsellorId: string,
    profilePicId: string,
  ) {
    const counsellorCheck = await this.counsellorModel
      .findOne({
        _id: counsellorId,
        'profilePicture._id': profilePicId,
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          throw new BadRequestException(T.counsellorNotFound);
        }

        return d;
      });

    Logger.verbose('Deleting photo for record...', 'Counsellor');
    await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      counsellorCheck.profilePicture.name,
    );
    Logger.verbose('Photo deleted for record', 'Counsellor');

    const updatedCounsellor = await this.counsellorModel.findOneAndUpdate(
      { 'profilePicture._id': profilePicId },
      {
        $set: { profilePictureURL: null },
        $unset: {
          profilePicture: { _id: new Types.ObjectId(profilePicId) },
        },
      },
      { new: true, lean: true },
    );
    return updatedCounsellor;
  }

  async statusChange(
    counsellorId: string,
    status: ChangeStatusI,
  ): Promise<any> {
    // finding the Counselor by ID
    await this.findSelectedCounsellor(counsellorId);

    const updatedCounselor = await this.counsellorModel.findByIdAndUpdate(
      { _id: counsellorId },
      {
        $set: status,
      },
      { new: true, lean: true },
    );
    return updatedCounselor;
  }

  async getCounsellorsForDashboard(user: User, limit: number, page: number) {
    const counsellorCheck = await this.findAll(user, limit, page);

    const counsellorsForDashboard: any = [];
    for (const counsellor of counsellorCheck.docs) {
      const meetingBookingCount = await this.meetingBookingModel.count({
        counsellor: new Types.ObjectId(counsellor._id),
        timeFrom: {
          $gte: new Date(startOfToday()),
          $lt: new Date(startOfTomorrow()),
        },
        status: MeetingBookingStatus.PROCESSING,
      });

      counsellorsForDashboard.push({
        ...counsellor,
        todayMeetingBooking: meetingBookingCount,
      });
    }

    return {
      docs: counsellorsForDashboard,
      pagination: counsellorCheck.pagination,
    };
  }

  async counsellorIndexUpdate() {
    const counsellorCheck = await this.counsellorModel
      .find()
      .sort({ index: 1 });

    let counsellorIndex = 1;
    for (const counsellor of counsellorCheck) {
      if (counsellor?.index === counsellorIndex)
        await this.counsellorModel.findByIdAndUpdate(
          counsellor._id,
          { $set: { index: counsellor.index } },
          { new: true, lean: true },
        );

      counsellorIndex++;
    }
  }
}
