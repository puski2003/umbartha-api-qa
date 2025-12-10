import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course, CourseSchema } from './schema/course.schema';
import { COURSE_COLLECTION } from './course.constants';
import { S3Module } from 'src/config/aws/aws-s3/module';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COURSE_COLLECTION, schema: CourseSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema }
    ]),
    S3Module,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
