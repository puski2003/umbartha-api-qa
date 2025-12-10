import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PublicClientService } from './public-client.service';
import {
  ClientParams,
  ExsistedClientParams,
  CreateClientDto,
} from './dto/public-client.dto';
import { ClientService } from 'src/modules/client/client.service';
import { CreateIntakeForm } from 'src/modules/client/dto/create.client.dto';

@Controller('public/client')
export class PublicClientController {
  constructor(
    private readonly publicClientService: PublicClientService,
    private readonly clientService: ClientService,
  ) {}

  @Get()
  async getClient(@Query() params: ExsistedClientParams) {
    return await this.publicClientService.findByPhone(params);
  }

  @Post()
  async createClient(@Body() client: CreateClientDto) {
    return await this.publicClientService.createClient(
      client.meetingBooking,
      client.counsellor,
      client,
    );
  }

  @Patch(':clientId/intake-form')
  async addIntakeForm(
    @Param() params: ClientParams,
    @Body() intakeForm: CreateIntakeForm,
  ) {
    return await this.publicClientService.addIntakeFormToClient(
      params.clientId,
      intakeForm,
    );
  }
}
