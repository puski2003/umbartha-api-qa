import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counsellor } from 'src/modules/counsellor/schemas/counsellor.schema';
import { CounsellorQuertI } from './public-counsellor.types';

@Injectable()
export class PublicCounsellorService {
  constructor(
    @InjectModel(Counsellor.name)
    private readonly counsellorModel: Model<Counsellor>,
  ) {}

  async findAll(query: CounsellorQuertI) {
    const filter: any = {};

    if (query.publishAppointments) {
      filter.publishAppointments = query.publishAppointments;
    }

    return await this.counsellorModel
      .find(filter, {
        profilePictureURL: 1,
        displayName: 1,
        title: 1,
        gender: 1,
        dateOfBirth: 1,
        email: 1,
        hotline: 1,
        mobile: 1,
        practiceStartedOn: 1,
        languagesSpoken: 1,
        sessionType: 1,
        services: 1,
        specialization: 1,
        description: 1,
        profilePicture: 1,
        publishAppointments: 1,
      })
      .populate([{ path: 'services', select: 'name title' }])
      .sort({ index: 1 })
      .lean();
  }

  async findOne(id: string) {
    const counsellor = await this.counsellorModel.findById(id);

    const publicCounsellor = {
      _id: counsellor._id,
      profilePictureURL: counsellor.profilePictureURL,
      title: counsellor.title,
      displayName: counsellor.displayName,
      gender: counsellor.gender,
      dateOfBirth: counsellor.dateOfBirth,
      email: counsellor.email,
      hotline: counsellor.hotline,
      mobile: counsellor.mobile,
      practiceStartedOn: counsellor.practiceStartedOn,
      languagesSpoken: counsellor.languagesSpoken,
      sessionType: counsellor.sessionType,
      services: counsellor.services,
      specialization: counsellor.specialization,
      profilePicture: counsellor.profilePicture,
      publishAppointments: counsellor.publishAppointments,
    };
    return publicCounsellor;
  }
}
