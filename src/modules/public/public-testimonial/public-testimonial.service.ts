import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Testimonial,
  TestimonialType,
} from 'src/modules/testimonial/schema/testimonial.schema';
import { TESTIMONIAL_COLLECTION } from 'src/modules/testimonial/testimonial.constants';

@Injectable()
export class PublicTestimonialService {
  constructor(
    @InjectModel(TESTIMONIAL_COLLECTION)
    private readonly testimonialModel: Model<Testimonial>,
  ) {}

  /**
   * Retrieves a paginated list of testimonials specificallt for the home page
   *
   * @param limit
   * @param page
   * @returns Promise that resolves to an array of testimonials
   */
  async findAllForHomePage(
    limit: number = 50,
    page: number = 1,
  ): Promise<Testimonial> {
    /**
     * Perform a query to find all testimonials of type 'HomePage'
     */
    return await this.testimonialModel
      .find({ type: TestimonialType.HomePage })
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();
  }

  /**
   * Finds testimonials by service Id
   *
   * @param serviceId
   * @returns an array of testimonials associals with the specified service
   */
  async findByService(limit: number = 50, page: number = 1, serviceId: string) {
    /**
     * Find testimonials associated with the specified service Id
     */
    return await this.testimonialModel
      .find({
        _serviceId: new Types.ObjectId(serviceId),
      })
      .sort({ createdDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();
  }
}
