import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CandidateModule } from './candidate/candidate.module';
import { ExamModule } from './exam/exam.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CandidateModule,
    ExamModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
