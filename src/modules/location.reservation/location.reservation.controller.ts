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
import { LocationReservationService } from './location.reservation.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import {
  PaginationQueryDto,
  ReservationParams,
} from './dto/query.location.reservation.dto';
import { CreateForDayReservationDto } from './dto/create.location.reservation.dto';
import { UpdateReservationDto } from './dto/update.location.reservation.dto';

@Controller('location-reservation')
export class LocationReservationController {
  constructor(
    private readonly locationReservationService: LocationReservationService,
  ) {}

  @Auth('jav')
  @Get()
  async findAll(@User() user: User, @Query() query: PaginationQueryDto) {
    return await this.locationReservationService.findAll(
      query._search,
      query,
      user,
      query.limit,
      query.page,
    );
  }

  @Auth('ctq')
  @Get(':reservationId')
  async findReservation(@Param() params: ReservationParams) {
    return await this.locationReservationService.findSelectedReservation(
      params.reservationId,
    );
  }

  @Auth('jde')
  @Post()
  async createReservation(@User() user: User, @Body() reservation: any) {
    return await this.locationReservationService.createReservation(
      user,
      reservation,
    );
  }

  @Auth('jde')
  @Post()
  async createDayReservation(
    @User() user: User,
    @Body() reservation: CreateForDayReservationDto,
  ) {
    return await this.locationReservationService.createDayReservation(
      user,
      reservation,
    );
  }

  @Auth('dnn')
  @Patch(':reservationId')
  async updatedReservation(
    @Param() params: ReservationParams,
    @Body() reservation: UpdateReservationDto,
  ) {
    return await this.locationReservationService.updateSelectedReservation(
      params.reservationId,
      reservation,
    );
  }

  @Auth('idj')
  @Delete(':reservationId')
  async deleteReservation(@Param() params: ReservationParams) {
    return await this.locationReservationService.deleteSelectedReservation(
      params.reservationId,
    );
  }
}
