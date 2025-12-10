import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [AuthenticationModule, CalendarModule],
})
export class MicrosoftGraphModule {}
