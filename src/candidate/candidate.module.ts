import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateService } from './service/candidate.service';
import { CandidateController } from './controller/candidate.controller';
import { CandidateSchema, Candidate } from 'src/schemas/candidate.schema';
import { AuthMiddleware } from 'src/middleware/authorization.middleware';
import { AuthService } from 'src/auth/service/auth.service';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [CandidateService, AuthService],
  controllers: [CandidateController],
})
export class CandidateModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'candidate',
      method: RequestMethod.GET,
    });
  }
}
