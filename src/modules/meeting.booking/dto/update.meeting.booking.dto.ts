import { IsEnum, IsNotEmpty } from 'class-validator';
import { MeetingBookingStatus } from '../schema/meeting.booking.schema';

export class MeetingBookingStatusDto {
  @IsNotEmpty()
  @IsEnum(MeetingBookingStatus)
  readonly status: string;
}
