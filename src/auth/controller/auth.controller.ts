import { Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/token')
  async token(@Req() request: Request, @Res() response: Response) {
    console.log(request.body);
    const token = await this.authService.token(request);
    if (token) {
      response.status(200).json(token);
    }
  }

  @Post('/refresh-token')
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    console.log(request.body);
    const refreshToken = await this.authService.refreshToken(request);
    if (refreshToken) {
      response.status(200).json(refreshToken);
    }
  }
}
