import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  private baseUrl: string;
  private clientID: string;
  private clientSecret: string;

  constructor(private readonly httpService: HttpService) {
    this.clientID =
      'AUqnmVYHz2F1H4qPlXunDvIPE7hOfQrObZGSsa2VfnYjNE85loUGA7DB1dqodsYhJTPWvkj85bxyIdn7';
    this.clientSecret =
      'EBF4t8EkOjYVBEezLF-bquw8Xu3iodMT9N6wz7EfMCcgha5ie863hGlKMc5xsVHMxLKk9XW_GC8lwrdz';
    this.httpService.axiosRef.defaults.baseURL =
      'https://api-m.sandbox.paypal.com/';
  }

  async getToken() {
    try {
      const auth = Buffer.from(
        this.clientID + ':' + this.clientSecret,
      ).toString('base64');

      const tokenRequest = await this.httpService.axiosRef.post(
        'v1/oauth2/token',
        {
          grant_type: 'client_credentials',
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return tokenRequest.data.access_token;
    } catch (e) {
      console.error('error: ', e);
      throw new BadRequestException(e.message);
    }
  }
}
