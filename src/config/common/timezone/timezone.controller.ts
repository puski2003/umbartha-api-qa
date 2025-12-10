import { Controller, Get, Query } from '@nestjs/common';
import { TimezoneService } from './timezone.service';
import { GPSCoordinateDto } from './dto/query.timezone.dto';

@Controller('timezone')
export class TimezoneController {
  constructor(private readonly timezoneService: TimezoneService) {}

  @Get('geographical')
  async getTimezone(@Query() { lat, lon }: GPSCoordinateDto) {
    return await this.timezoneService.getTimezone(lat, lon);
  }
}
