import { Module } from '@nestjs/common';
import { PublicServiceController } from './public-service.controller';
import { PublicServiceService } from './public-service.service';
import { ServiceModule } from 'src/modules/service/service.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SERVICE_COLLECTION } from 'src/modules/service/service.constants';
import { ServiceSchema } from 'src/modules/service/schema/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SERVICE_COLLECTION, schema: ServiceSchema },
    ]),
    ServiceModule,
  ],
  controllers: [PublicServiceController],
  providers: [PublicServiceService],
})
export class PublicServiceModule {}
