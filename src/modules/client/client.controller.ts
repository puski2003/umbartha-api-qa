import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Redirect,
} from '@nestjs/common';
import { ClientService } from './client.service';
import {
  CreateClientDto,
  CreateIntakeForm,
  EmailVerificationDto,
} from './dto/create.client.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  ClientIntakeFormParam,
  ClientParam,
  ClientPhoneParam,
  EmailVerifyDto,
} from './dto/query.client.sto';
import { UpdateClientDto } from './dto/update.client.dto';
import { User } from 'src/config/authorization/user.decorator';
import { PaginationQueryDto } from 'src/config/common/dto/pagination-query.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Auth('jar')
  @Get()
  async findAll(
    @User() user: User,
    @Query() { _search, limit, page }: PaginationQueryDto,
  ) {
    return await this.clientService.findAll(_search, limit, page, user);
  }

  @Auth('jar')
  @Get(':clientId')
  async findOne(@Param() params: ClientParam) {
    return await this.clientService.findSelectedClient(params.clientId);
  }

  @Auth('jar')
  @Get('phone/check')
  async findClientByPhone(@Query() data: ClientPhoneParam) {
    return await this.clientService.findClientUseEmail(data.phone);
  }

  @Auth('jar')
  @Post()
  async crete(@Body() client: CreateClientDto) {
    return await this.clientService.createClient(client);
  }

  @Auth('jar')
  @Patch(':clientId')
  async update(@Param() params: ClientParam, @Body() client: UpdateClientDto) {
    return await this.clientService.updateSelectedClient(
      params.clientId,
      client,
    );
  }

  @Auth('jar')
  @Delete(':clientId')
  async remove(@Param() params: ClientParam) {
    return await this.clientService.deleteSelectClient(params.clientId);
  }

  @Auth('jar')
  @Get(':clientId/intake-form/:dataFormId')
  async findIntakeForm(@Param() params: ClientIntakeFormParam) {
    return await this.clientService.findIntakeForm(
      params.clientId,
      params.dataFormId,
    );
  }

  @Auth('jar')
  @Put(':clientId/intake-form')
  async addIntakeForm(
    @Param() params: ClientParam,
    @Body() intakeForm: CreateIntakeForm,
  ) {
    return await this.clientService.addIntakeFormToClient(
      params.clientId,
      intakeForm,
    );
  }

  @Auth('jar')
  @Delete(':clientId/intake-form/:dataFormId')
  async removeIntakeForm(@Param() params: ClientIntakeFormParam) {
    return await this.clientService.removeIntakeFormFromClient(
      params.clientId,
      params.dataFormId,
    );
  }

  @Get(':clientId/email/email-verify-link')
  async createEmailVerifyLink(
    @Param() params: ClientParam,
    @Body() emailVerification: EmailVerificationDto,
  ) {
    return await this.clientService.clientEmailVerifyLink(
      params.clientId,
      emailVerification.email,
    );
  }

  @Redirect()
  @Get(':clientId/email/email-verify')
  async emailVerify(
    @Param() params: ClientParam,
    @Query() data: EmailVerifyDto,
  ) {
    return await this.clientService
      .clientEmailVerify(params.clientId, data)
      .then(async () => {
        return { url: 'https://i.imgflip.com/4lfgu3.jpg' };
      })
      .catch((e) => {
        Logger.debug(e);
        return { url: 'https://youtu.be/yzeqQ_eptVk' };
      });
  }
}
