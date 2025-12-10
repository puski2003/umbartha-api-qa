import { Module } from '@nestjs/common';
import { CounselorController } from './counsellor.controller';
import { CounsellorService } from './counsellor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounsellorSchema } from './schemas/counsellor.schema';
import { ServiceModule } from '../service/service.module';
import { LocationModule } from '../location/location.module';
import { COUNSELLOR_COLLECTION } from './counsellor.constants';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBookingSchema } from '../meeting.booking/schema/meeting.booking.schema';
import { CounselorServiceController } from './counselor.service.controller';
import { CounselorServiceService } from './counselor.service.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
      { name: MEETING_BOOKING_COLLECTION, schema: MeetingBookingSchema },
    ]),
    ServiceModule,
    LocationModule,
    S3Module,
  ],
  controllers: [CounselorController, CounselorServiceController],
  providers: [CounsellorService, CounselorServiceService],
  exports: [CounsellorService],
})
export class CounsellorModule {}
