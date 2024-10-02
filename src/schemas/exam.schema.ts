import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Result, UserType } from 'src/enums/enums';

@Schema({ collection: 'exam' })
export class Exam extends Document {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  skill: string;

  @Prop({ required: true })
  level: string;

  @Prop({})
  finalMarks?: number;

  @Prop({})
  result?: Result;
}
export const ExamSchema = SchemaFactory.createForClass(Exam);
