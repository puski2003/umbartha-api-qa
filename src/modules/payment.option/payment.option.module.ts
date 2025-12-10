import { Module } from '@nestjs/common';
import { PaymentOptionController } from './payment.option.controller';
import { PaymentOptionService } from './payment.option.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentOptionSchema } from './schemas/payment.option.schema';
import { PAYMENT_OPTION_COLLECTION } from './payment.option.constants';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PAYMENT_OPTION_COLLECTION, schema: PaymentOptionSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
    ]),
  ],
  controllers: [PaymentOptionController],
  providers: [PaymentOptionService],
  exports: [PaymentOptionService],
})
export class PaymentOptionModule {}
