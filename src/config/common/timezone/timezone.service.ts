import { Injectable } from '@nestjs/common';
import { find } from 'geo-tz';

@Injectable()
export class TimezoneService {
  async getTimezone(lat: number, lon: number) {
    const timezone = find(lat, lon);
    return { timezone: timezone[0] };
  }
}
