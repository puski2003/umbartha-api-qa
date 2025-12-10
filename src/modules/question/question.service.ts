import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AddAnswerDto } from './dto/add-answer.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    const question = await this.questionModel.create({
      courseId: new Types.ObjectId(dto.courseId),
      userId: dto.userId,
      userName: dto.userName,
      moduleIndex: dto.moduleIndex,
      videoIndex: dto.videoIndex,
      text: dto.text,
      isAnswered: false,
      answers: [],
    });
    return question;
  }

  async findByCourse(courseId: string): Promise<Question[]> {
    return this.questionModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findAll(limit: number = 20, page: number = 1) {
    const totalDocs = await this.questionModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.questionModel
      .find()
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 })
      .lean();

    return {
      docs,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        nextPage: page + 1,
        page,
        prevPage: page - 1,
        totalDocs,
        totalPages,
      },
    };
  }

  async findUnanswered(limit: number = 20, page: number = 1) {
    const filter = { isAnswered: false };
    const totalDocs = await this.questionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.questionModel
      .find(filter)
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 })
      .lean();

    return {
      docs,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        nextPage: page + 1,
        page,
        prevPage: page - 1,
        totalDocs,
        totalPages,
      },
    };
  }

  async addAnswer(questionId: string, dto: AddAnswerDto): Promise<Question> {
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      Logger.error(`Question not found: ${questionId}`);
      throw new NotFoundException('Question not found');
    }

    question.answers.push({
      instructorId: dto.instructorId,
      instructorName: dto.instructorName,
      text: dto.text,
      createdAt: new Date(),
    });
    question.isAnswered = true;

    await question.save();
    return question;
  }

  async findById(questionId: string): Promise<Question> {
    const question = await this.questionModel.findById(questionId).lean();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    const question = await this.questionModel
      .findByIdAndRemove(questionId)
      .lean();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }
}
