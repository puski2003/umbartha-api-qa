import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EVENT_CATEGORY_COLLECTION } from './event.constants';
import { Model } from 'mongoose';
import { EventCategory } from './schema/event-category.schema';
import { EventCategoryI } from './event-category.types';
import { isEmpty } from 'class-validator';

const T = {
  categoryNotFound: 'event category is not found',
};

@Injectable()
export class EventCategoryService {
  constructor(
    @InjectModel(EVENT_CATEGORY_COLLECTION)
    private readonly eventCategoryModel: Model<EventCategory>,
  ) {}

  /**
   * retrieves an array of all Event Category from database
   * @returns {Promise<EventCategory[]>} promise that resolves to the found array of Event Category
   */
  async findAll(limit: number, page: number) {
    const totalDocs = await this.eventCategoryModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const eventCategoriesCheck = await this.eventCategoryModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    return {
      docs: eventCategoriesCheck,
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
   * retrieves a Event Category based on the provided ID
   * @param {string} eventId - ID of created Event Category
   * @returns {Promise<EventCategory>} promise that resolves to the found Event Category
   */
  async findSelectedCategory(eventId: string): Promise<EventCategory> {
    const eventCategoryCheck = await this.eventCategoryModel
      .findById(eventId)
      .lean();

    if (isEmpty(eventCategoryCheck)) {
      Logger.debug(T.categoryNotFound.toUpperCase());
      throw new NotFoundException(T.categoryNotFound);
    }
    return eventCategoryCheck;
  }

  /**
   * creates a Event Category based on the provided data
   * retrieves the created Event Category
   * @param {EventCategoryI} category - data for creating a Event Category
   * @returns {Promise<EventCategory>} promise that resolves to the created Event Category
   */
  async createCategory(category: EventCategoryI): Promise<EventCategory> {
    const createdEventCategory = await this.eventCategoryModel.create(category);
    return createdEventCategory;
  }

  // async createBulk(
  //   createEventCategoryI: CreateEventCategoryI[],
  // ): Promise<EventCategory[]> {
  //   const createBulkEventCategory = await this.eventCategoryModel.insertMany(
  //     createEventCategoryI,
  //   );
  //   return createBulkEventCategory;
  // }

  /**
   * updates a Event Category based on the provided ID and data
   * retrieves the updated Event Category
   * @param {string} categoryId - ID of created Event Category to be updated
   * @param {UpdateEventCategoryI} category - data for updating the Event Category
   * @returns {Promise<EventCategory>} promise that resolves to the updated Event Category
   */
  async updateSelectedCategory(
    categoryId: string,
    category: EventCategoryI,
  ): Promise<EventCategory> {
    await this.findSelectedCategory(categoryId);

    const updatedEventCategory = await this.eventCategoryModel
      .findByIdAndUpdate(
        { _id: categoryId },
        { $set: category },
        { new: true, lean: true },
      )
      .lean();

    return updatedEventCategory;
  }

  /**
   * removes an Event Category based on the provided ID
   * retrives the removed Event Category
   * @param {string} categoryId - ID of created Event Category to be removed
   * @returns {Promise<EventCategory>} promise that resolves to the removed Event Category
   */
  async deleteSelectedCategory(categoryId: string): Promise<EventCategory> {
    await this.findSelectedCategory(categoryId);

    const deletedEventCategory = await this.eventCategoryModel
      .findByIdAndRemove(categoryId)
      .lean();
    return deletedEventCategory;
  }
}
