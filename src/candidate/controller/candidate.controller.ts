import { Controller, Post, Body, Get, Req, Res, Param } from '@nestjs/common';
import { CandidateService } from '../service/candidate.service';
import { CandidateApiDto } from 'src/dtos/candidate.dto';
import { Request, Response } from 'express';
import { RequestWithUser } from 'src/interface/global.interface';
import { LoginDto } from 'src/dtos/login.dto';

@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('')
  async getCandidate(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const candidate = await this.candidateService.getCandidate(request);
    if (candidate) {
      response.status(200).json(candidate);
    }
  }

  @Post('')
  async registerCandidate(
    @Body() candidateData: CandidateApiDto,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const candidate = await this.candidateService.registerCandidate(
      candidateData,
      request,
    );
    if (candidate) {
      response.status(201).json(candidate);
    }
  }

  @Post('/token')
  async loginCandidate(
    @Body() loginData: LoginDto,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const candidate = await this.candidateService.loginCandidate(
      loginData,
      request,
    );
    if (candidate) {
      response.status(201).json(candidate);
    }
  }
  @Post('/forgot-password')
  async forgotPassword(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const forgotPassword = await this.candidateService.forgotPassword(request);
    if (forgotPassword) {
      response.status(201).json(forgotPassword);
    }
  }
  @Post('/reset-password')
  async resetPassword(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const resetPassword = await this.candidateService.resetPassword(request);
    if (resetPassword) {
      response.status(201).json(resetPassword);
    }
  }
  @Get('verify/:token')
  async verifyEmail(
    @Param('token') token: string,
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const verifyEmail = await this.candidateService.verifyEmail(request, token);
    if (verifyEmail) {
      response.status(201).json(verifyEmail);
    }
  }
}
