import { Module } from '@nestjs/common';
import { CounsellorRateController } from './counsellor.rate.controller';
import { CounsellorRateService } from './counsellor.rate.service';
import { MongooseModule } from '@nestjs/mongoose';
import { COUNSELLOR_RATE_COLLECTION } from './counsellor.rate.constants';
import { CounsellorRateSchema } from './schema/counsellor.rate.schema';
import { CounsellorModule } from '../counsellor/counsellor.module';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COUNSELLOR_RATE_COLLECTION, schema: CounsellorRateSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
    ]),
  ],
  controllers: [CounsellorRateController],
  providers: [CounsellorRateService],
})
export class CounsellorRateModule {}
