import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 } from 'uuid';

@Schema({ collection: 'question' })
export class Question extends Document {
  @Prop({ required: true })
  skill: string;

  @Prop({ required: true })
  level: string;

  @Prop({
    type: [
      {
        id: { type: String, default: () => v4() },
        question: String,
        type: String,
        explanation: String,
        testcases: [Object],
        constraints: String,
      },
    ],
    required: true,
  })
  questionCoding: Array<{
    id: string;
    question: string;
    type: string;
    explanation?: string;
    testcases?: Array<object>;
    constraints: string;
  }>;

  @Prop({
    type: [
      {
        id: { type: String, default: () => v4() },
        question: String,
        answer: String,
        type: String,
        explanation: String,
        options: [String],
      },
    ],
    required: true,
  })
  questionMcq: Array<{
    id: string;
    question: string;
    answer: string;
    type: string;
    explanation?: string;
    options?: Array<string>;
  }>;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
