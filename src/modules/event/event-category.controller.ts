import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventCategoryService } from './event-category.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  CreateEventCategoryDto,
  EventCategoryParam,
  PaginationQueryDto,
  UpdateEventCategoryDto,
} from './dto/event-category.dto';

@Controller('event-category')
export class EventCategoryController {
  constructor(private readonly eventCategoryService: EventCategoryService) {}

  @Auth('jar')
  @Get()
  findAllEventCategory(@Query() { limit, page }: PaginationQueryDto) {
    return this.eventCategoryService.findAll(limit, page);
  }

  @Auth('jar')
  @Get(':eventCategoryId')
  findOneEventCategory(@Param() param: EventCategoryParam) {
    return this.eventCategoryService.findSelectedCategory(
      param.eventCategoryId,
    );
  }

  @Auth('jar')
  @Post()
  createEventCategory(@Body() createEventCategoryDto: CreateEventCategoryDto) {
    return this.eventCategoryService.createCategory(createEventCategoryDto);
  }

  @Auth('jar')
  @Patch(':eventCategoryId')
  updateOneEventCategory(
    @Param() param: EventCategoryParam,
    @Body() updateEventCategoryDto: UpdateEventCategoryDto,
  ) {
    return this.eventCategoryService.updateSelectedCategory(
      param.eventCategoryId,
      updateEventCategoryDto,
    );
  }

  @Auth('jar')
  @Delete(':eventCategoryId')
  removeOneEventCategory(@Param() param: EventCategoryParam) {
    return this.eventCategoryService.deleteSelectedCategory(
      param.eventCategoryId,
    );
  }
}
