import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  readonly title: string;

  @Prop()
  readonly description: string;

  @Prop()
  readonly thumbnail: string;

  @Prop([
    {
      title: { type: String },
      description: { type: String },
      videos: [
        {
          title: { type: String },
          videoUrl: { type: String },
          duration: { type: String },
          resources: [
            {
              title: { type: String },
              url: { type: String },
              type: { type: String },
            },
          ],
        },
      ],
    },
  ])
  readonly modules: {
    title: string;
    description: string;
    videos: {
      title: string;
      videoUrl: string;
      duration: string;
      resources?: {
        title: string;
        url: string;
        type: string;
      }[];
    }[];
  }[];

  @Prop([
    {
      text: { type: String, required: true },
      name: { type: String, required: true },
    },
  ])
  readonly testimonials: {
    text: string;
    name: string;
  }[];

  @Prop({ default: 0 })
  readonly price: number;

  @Prop()
  readonly instructorId: string;

  @Prop([String])
  readonly learningObjectives: string[];

  @Prop()
  readonly demoVideoUrl: string;

  @Prop()
  readonly demoVideoDuration: string;

  @Prop({ default: true })
  readonly showContentPreview: boolean;

  @Prop({ default: 'Draft' })
  readonly status: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
