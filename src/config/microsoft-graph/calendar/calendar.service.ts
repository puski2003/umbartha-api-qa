import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CalendarEventI } from './calendar.types';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly httpService: HttpService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async createScheduleMeeting(user: string, event: CalendarEventI) {
    try {
      const token = await this.authenticationService.getAccessToken();

      const scheduleMeetingRequest = await this.httpService.axiosRef.post(
        `https://graph.microsoft.com/v1.0/users/${user}/events`,
        JSON.stringify(event),
        {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return scheduleMeetingRequest.data;
    } catch (e) {
      console.error(e.message);
    }
  }

  async cancelScheduleMeeting(user: string, eventId: string) {
    try {
      const token = await this.authenticationService.getAccessToken();

      const scheduleMeetingRequest = await this.httpService.axiosRef.post(
        `https://graph.microsoft.com/v1.0/users/${user}/events/${eventId}/cancel`,
        '',
        {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return scheduleMeetingRequest.data;
    } catch (e) {
      console.error(e.message);
    }
  }
}
