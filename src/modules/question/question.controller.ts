import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AddAnswerDto } from './dto/add-answer.dto';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // Create a new question (public for students)
  @Post()
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return await this.questionService.createQuestion(dto);
  }

  // Get questions for a course (public for students)
  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    return await this.questionService.findByCourse(courseId);
  }

  // Get all questions (admin)
  @Auth('jar')
  @Get()
  async findAll(
    @Query('limit') limit: string = '20',
    @Query('page') page: string = '1',
  ) {
    return await this.questionService.findAll(
      parseInt(limit, 10),
      parseInt(page, 10),
    );
  }

  // Get unanswered questions (admin)
  @Auth('jar')
  @Get('unanswered')
  async findUnanswered(
    @Query('limit') limit: string = '20',
    @Query('page') page: string = '1',
  ) {
    return await this.questionService.findUnanswered(
      parseInt(limit, 10),
      parseInt(page, 10),
    );
  }

  // Get single question
  @Get(':questionId')
  async findById(@Param('questionId') questionId: string) {
    return await this.questionService.findById(questionId);
  }

  // Add answer to question (admin/instructor)
  @Auth('jar')
  @Post(':questionId/answer')
  async addAnswer(
    @Param('questionId') questionId: string,
    @Body() dto: AddAnswerDto,
  ) {
    return await this.questionService.addAnswer(questionId, dto);
  }

  // Delete question (admin)
  @Auth('jar')
  @Delete(':questionId')
  async deleteQuestion(@Param('questionId') questionId: string) {
    return await this.questionService.deleteQuestion(questionId);
  }
}
