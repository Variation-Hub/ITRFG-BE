import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ExamService } from '../service/exam.service';
import { ResponseModel } from 'src/models/response.model';
import { Request, Response } from 'express';
import { RequestWithUser } from 'src/interface/global.interface';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('/previous/assessment')
  async previousassessment(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.examService.previousassessment(request);
    if (result) {
      response.status(201).json(result);
    }
  }

  @Post('/coding/:type')
  async examSubjectve(
    @Param('type') type: string,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const exam = await this.examService.examSubjective(type, request);
    if (exam) {
      response.status(201).json(exam);
    }
  }

  @Post('/mcq/:type')
  async examMcq(
    @Param('type') type: string,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const exam = await this.examService.examMcq(type, request);
    if (exam) {
      response.status(201).json(exam);
    }
  }

  @Post('/answercheck')
  async answercheck(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.examService.answercheck(request);
    if (result) {
      response.status(201).json(result);
    }
  }

  @Post('/answercheck/coding')
  async answercheckcoding(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const result = await this.examService.answercheckcoding(request);
    if (result) {
      response.status(201).json(result);
    }
  }
}
