import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as qs from 'qs';

@Injectable()
export class AuthenticationService {
  constructor(private readonly httpService: HttpService) {}

  async getAccessToken() {
    const data = {
      client_id: process.env.MICROSOFT_GRAPH_CLIENT_ID,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    };

    try {
      const tokenRequest = await this.httpService.axiosRef.post(
        `https://login.microsoftonline.com/${process.env.MICROSOFT_GRAPH_TENANT}/oauth2/v2.0/token`,
        qs.stringify(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return tokenRequest.data.access_token;
    } catch (e) {
      console.error(e.message);
    }
  }
}
