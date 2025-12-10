import { Module } from '@nestjs/common';
import { PayitForwardController } from './payit-forward.controller';
import { PayitForwardService } from './payit-forward.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PAYIT_FORWARD_COLLECTION } from './payit-forward.constants';
import { PayitForwardSchema } from './schema/payit-forward.schema';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { SESModule } from 'src/config/aws/aws-ses/module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PAYIT_FORWARD_COLLECTION, schema: PayitForwardSchema },
    ]),
    S3Module,
    SESModule,
  ],
  controllers: [PayitForwardController],
  providers: [PayitForwardService],
  exports: [PayitForwardService],
})
export class PayitForwardModule {}
