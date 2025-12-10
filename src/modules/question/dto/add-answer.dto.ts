import { IsNotEmpty, IsString } from 'class-validator';

export class AddAnswerDto {
  @IsNotEmpty()
  @IsString()
  instructorId: string;

  @IsNotEmpty()
  @IsString()
  instructorName: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
