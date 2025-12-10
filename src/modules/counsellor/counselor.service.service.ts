import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { COUNSELLOR_COLLECTION } from './counsellor.constants';
import { Counsellor } from './schemas/counsellor.schema';
import { isEmpty } from 'class-validator';

const T = {
  counsellorNotFound: 'Counsellor is not found given Id',
};

@Injectable()
export class CounselorServiceService {
  constructor(
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
  ) {}

  async updateService(
    counsellor: string,
    services: string[],
  ): Promise<Counsellor> {
    const counsellorCheck = await this.counsellorModel
      .findById(counsellor)
      .lean();
    if (isEmpty(counsellorCheck))
      throw new BadRequestException(T.counsellorNotFound);

    /**
     * duplicate checking
     */
    for (const service of services) {
      const isDuplicate = counsellorCheck.services.some(
        (id) => id.toString() === new Types.ObjectId(service).toString(),
      );

      if (isDuplicate)
        throw new BadRequestException(
          `Service with id ${services[0]} already exists`,
        );
    }

    (counsellorCheck.services as unknown as Types.ObjectId[]).push(
      ...services.map((service) => new Types.ObjectId(service)),
    );

    return await this.counsellorModel.findByIdAndUpdate(
      counsellor,
      { $set: { services: counsellorCheck.services } },
      { new: true, lean: true },
    );
  }

  async deleteService(counsellor: string, service: string): Promise<any> {
    const counsellorCheck = await this.counsellorModel
      .findById(counsellor)
      .lean();
    if (isEmpty(counsellorCheck))
      throw new NotFoundException(T.counsellorNotFound);

    const udpatedCounsellor = await this.counsellorModel.findOneAndUpdate(
      {
        _id: counsellor,
        services: { $eq: new Types.ObjectId(service) },
      },
      { $pull: { services: new Types.ObjectId(service) } },
      { new: true, lean: true },
    );

    if (isEmpty(udpatedCounsellor))
      throw new BadRequestException(
        'No services were removed. Possible reason: services not found',
      );

    return udpatedCounsellor;
  }
}
