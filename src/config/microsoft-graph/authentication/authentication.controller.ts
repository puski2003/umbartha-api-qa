import { Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('microsoft-graph/authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  async getAccessToken() {
    return await this.authenticationService.getAccessToken();
  }
}
