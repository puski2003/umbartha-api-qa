import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsOptional()
  @IsNumber()
  moduleIndex?: number;

  @IsOptional()
  @IsNumber()
  videoIndex?: number;

  @IsNotEmpty()
  @IsString()
  text: string;
}
