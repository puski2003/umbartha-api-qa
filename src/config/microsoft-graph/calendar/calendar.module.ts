import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { HttpModule } from '@nestjs/axios';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [HttpModule, AuthenticationModule],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
