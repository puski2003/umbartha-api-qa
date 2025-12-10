import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaymentOptionService } from './payment.option.service';
import { CreatePaymentOptionDto } from './dto/create.payment.option.dto';
import { UpdatePaymentOptionDto } from './dto/update.payment.option.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import {
  PaginationQueryDto,
  PaymentOptionParams,
} from './dto/query.payment.option.dto';
import { User } from 'src/config/authorization/user.decorator';

@Controller('payment-option')
export class PaymentOptionController {
  constructor(private readonly paymentService: PaymentOptionService) {}

  @Auth('jar')
  @Get()
  async findAll(
    @User() user: User,
    @Query() { limit, page, meetingType, counsellor }: PaginationQueryDto,
  ) {
    return await this.paymentService.findAll(
      limit,
      page,
      user,
      meetingType,
      counsellor,
    );
  }

  @Auth('jar')
  @Get(':paymentOption')
  async findOne(@Param() params: PaymentOptionParams) {
    return await this.paymentService.findById(params.paymentOption);
  }

  @Auth('jar')
  @Post()
  async crete(@Body() payment: CreatePaymentOptionDto) {
    return await this.paymentService.createOption(payment);
  }

  @Auth('jar')
  @Patch(':paymentOption')
  async update(
    @Param() params: PaymentOptionParams,
    @Body() payment: UpdatePaymentOptionDto,
  ) {
    return await this.paymentService.updateOption(
      params.paymentOption,
      payment,
    );
  }

  @Auth('jar')
  @Delete(':paymentOption')
  async remove(@Param() params: PaymentOptionParams) {
    return await this.paymentService.deleteOption(params.paymentOption);
  }

  @Auth('jar')
  @Put(':paymentOption')
  async changeEnabled(@Param() params: PaymentOptionParams) {
    return await this.paymentService.changeEnabled(params.paymentOption);
  }
}
