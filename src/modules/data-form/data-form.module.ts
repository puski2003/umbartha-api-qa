import { Module } from '@nestjs/common';
import { DataFormController } from './data-form.controller';
import { DataFormService } from './data-form.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DataForm, DataFormSchema } from './schemas/data-form.schema';
import { CounsellorModule } from '../counsellor/counsellor.module';

@Module({
  imports: [
    CounsellorModule,
    MongooseModule.forFeature([
      { name: DataForm.name, schema: DataFormSchema },
    ]),
  ],
  controllers: [DataFormController],
  providers: [DataFormService],
  exports: [DataFormService],
})
export class DataFormModule {}
