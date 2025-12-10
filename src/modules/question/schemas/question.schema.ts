import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Answer {
  @Prop({ required: true })
  instructorId: string;

  @Prop({ required: true })
  instructorName: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop()
  moduleIndex: number;

  @Prop()
  videoIndex: number;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isAnswered: boolean;

  @Prop({ type: [AnswerSchema], default: [] })
  answers: Answer[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
