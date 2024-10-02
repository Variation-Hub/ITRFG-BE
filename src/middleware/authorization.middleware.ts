// auth.middleware.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/service/auth.service';
import { RequestWithUser } from 'src/interface/global.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) {
        throw new HttpException(
          'Authorization header is missing',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const [, jwt] = authorizationHeader.split('Bearer ');
      const authResponse = await this.authService.validate(jwt);
      if (!authResponse?.status) {
        throw new HttpException(
          { message: authResponse?.message, status: false },
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (
        typeof authResponse?.data?.decodedToken === 'object' &&
        authResponse?.data?.decodedToken !== null
      ) {
        req.email = authResponse.data.decodedToken.email;
        req.userId = authResponse.data.decodedToken.userId;
      } else {
        throw new HttpException(
          { message: 'Invalid decoded token', status: false },
          HttpStatus.UNAUTHORIZED,
        );
      }
      next();
    } catch (error) {
      res.status(401).json({ message: error.message, status: false });
    }
  }
}
