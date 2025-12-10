import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from 'src/modules/service/schema/service.schema';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';

@Injectable()
export class PublicServiceService {
  constructor(
    @InjectModel(SERVICE_COLLECTION)
    private readonly serviceModel: Model<Service>,
  ) {}

  /**
   * Retrieves all services with pagination
   *
   * @param limit
   * @param page
   * @returns a promise resolving to an arrat of services with associated group service
   */
  async findAll(limit: number = 50, page: number = 1) {
    return await this.serviceModel
      .find()
      .populate('groupService')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .populate('groupService')
      .lean();
  }

  /**
   * Retrieves a service by Id
   *
   * @param serviceId
   * @returns a promise resolving to the service object with its associted group service
   */
  async findById(serviceId: string) {
    return await this.serviceModel
      .findById(serviceId)
      .populate('groupService')
      .lean();
  }
}
