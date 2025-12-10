import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/modules/event/schema/event.schema';
import { EventI } from 'src/modules/event/event.types';
import { EventService } from 'src/modules/event/event.service';
import { isNotEmpty } from 'class-validator';
import { startOfToday } from 'date-fns';
import { PaginationDto } from './dto/public-event.dto';

@Injectable()
export class PublicEventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    private readonly eventService: EventService,
  ) {}

  async findAllOngoingEvent(pagination: PaginationDto) {
    const events = await this.eventModel.find().populate('category');

    const filterEvents = events.filter(
      (d) =>
        new Date(d.dates[0]?.dateTo) >= new Date(startOfToday()) &&
        isNotEmpty(d.timings[0] && d.speakers[0] && d.gallery[0]),
    );

    for (const event of filterEvents) {
      event.timings.sort(
        (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
      );
    }

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = pagination.page * pagination.limit;

    const paginateEvents = filterEvents.slice(startIndex, endIndex);

    const totalDocs = filterEvents.length;
    const totalPages = Math.ceil(totalDocs / pagination.limit);

    return {
      docs: paginateEvents.slice(startIndex, endIndex),
      pagination: {
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
        limit: pagination.limit,
        nextPage: pagination.page + 1,
        page: pagination.page,
        prevPage: pagination.page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  async findAllPastEvent(pagination: PaginationDto) {
    const events = await this.eventModel.find().populate('category');

    const filterEvents = events.filter(
      (d) =>
        new Date(d.dates[0]?.dateTo) < new Date(startOfToday()) &&
        isNotEmpty(d.timings[0] && d.speakers[0] && d.gallery[0]),
    );

    for (const event of filterEvents)
      event.timings.sort(
        (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
      );

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = pagination.page * pagination.limit;

    const paginateEvents = filterEvents.slice(startIndex, endIndex);

    const totalDocs = filterEvents.length;
    const totalPages = Math.ceil(totalDocs / pagination.limit);

    return {
      docs: paginateEvents.slice(startIndex, endIndex),
      pagination: {
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
        limit: pagination.limit,
        nextPage: pagination.page + 1,
        page: pagination.page,
        prevPage: pagination.page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  async findOne(eventId: string) {
    const event = await this.eventService.findSelectedEvent(eventId);

    event?.timings?.sort(
      (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
    );
    return event;
  }

  async create(event: EventI) {
    const create = await this.eventService.createEvent(event);
    return create;
  }
}
