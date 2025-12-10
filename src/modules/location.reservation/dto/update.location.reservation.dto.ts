import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateReservationDto {
  @IsNotEmpty()
  @IsDateString()
  readonly reserveFrom: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly reserveTo: Date;

  @IsOptional()
  @IsString()
  readonly location: string;
}
