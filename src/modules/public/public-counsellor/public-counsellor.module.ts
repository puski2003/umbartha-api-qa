import { Module } from '@nestjs/common';
import { PublicCounsellorController } from './public-counsellor.controller';
import { PublicCounsellorService } from './public-counsellor.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Counsellor,
  CounsellorSchema,
} from 'src/modules/counsellor/schemas/counsellor.schema';
import {
  Service,
  ServiceSchema,
} from 'src/modules/service/schema/service.schema';
import { CounsellorModule } from 'src/modules/counsellor/counsellor.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counsellor.name, schema: CounsellorSchema },
    ]),
  ],
  controllers: [PublicCounsellorController],
  providers: [PublicCounsellorService],
})
export class PublicCounsellorModule {}
