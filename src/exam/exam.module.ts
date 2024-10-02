import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamService } from './service/exam.service';
import { ExamController } from './controller/exam.controller';
import { Exam, ExamSchema } from 'src/schemas/exam.schema';
import { Question, QuestionSchema } from 'src/schemas/question.schema';
import { Candidate, CandidateSchema } from 'src/schemas/candidate.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthService } from 'src/auth/service/auth.service';
import { AuthMiddleware } from 'src/middleware/authorization.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ExamService, AuthService],
  controllers: [ExamController],
})
export class ExamModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'exam/coding/:type',
        method: RequestMethod.POST,
      },
      {
        path: 'exam/mcq/:type',
        method: RequestMethod.POST,
      },
      {
        path: 'exam/answercheck',
        method: RequestMethod.POST,
      },
      {
        path: 'exam/previous/assessment',
        method: RequestMethod.GET,
      },
      {
        path: 'exam/answercheck/coding',
        method: RequestMethod.POST,
      },
    );
  }
}
