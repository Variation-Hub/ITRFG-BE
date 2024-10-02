import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async token(request: Request) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const optionsForAccess = { expiresIn: Number(process.env.TOKEN_LIFE) };
      const optionsForRefresh = {
        expiresIn: Number(process.env.REFRESH_TOKEN_LIFE),
      };
      console.log(optionsForRefresh, 'aaaaaa');
      console.log(request.body.type, 'ddd');
      if (request.body.type == 'register') {
        const user = new this.userModel({
          email: request.body.email,
          userType: request.body.userType,
        });
        console.log(user, 'ddd');
        await user.save();
        const payload = { userId: user?._id.toString(), email: user?.email };
        const accessToken = jwt.sign(payload, secretKey, optionsForAccess);
        const refreshToken = jwt.sign(payload, secretKey, optionsForRefresh);
        console.log(accessToken, refreshToken);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        await user.save();
        console.log(user, 'ddd');
        const data = {
          token_type: 'Bearer',
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: user?._id.toString(),
        };
        return { status: true, data: data, message: 'success' };
      }
      if (request.body.type == 'login') {
        const user = await this.userModel
          .findOne({
            email: request.body.email,
            userType: request.body.userType,
          })
          .exec();
        const payload = { userId: user?._id.toString(), email: user?.email };
        console.log(payload, 'ffff');
        const accessToken = jwt.sign(payload, secretKey, optionsForAccess);
        const refreshToken = jwt.sign(payload, secretKey, optionsForRefresh);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
        const data = {
          token_type: 'Bearer',
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: user?._id.toString(),
        };
        return { status: true, data: data, message: 'success' };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async validate(jwtToken: string) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const decodedToken = jwt.verify(jwtToken, secretKey);
      const data = { valid: true, decodedToken };
      return { status: true, data: data, message: 'success' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { message: 'Token has expired', status: false, statusCode: 401 };
      } else if (error.name === 'JsonWebTokenError') {
        return {
          message: 'Invalid token format',
          status: false,
          statusCode: 401,
        };
      } else {
        return {
          message: 'Token verification failed',
          status: false,
          statusCode: 401,
        };
      }
    }
  }

  async refreshToken(request: Request) {
    try {
      const secretKey = process.env.JWT_SECRET;
      const optionsForAccess = { expiresIn: Number(process.env.TOKEN_LIFE) };
      const optionsForRefresh = {
        expiresIn: Number(process.env.REFRESH_TOKEN_LIFE),
      };
      const access_token_payload = jwt.decode(request.body.accessToken) as {
        userId: string;
      };
      console.log(access_token_payload, 'Dsd');
      const user = await this.userModel.findOne({
        _id: access_token_payload.userId,
      });

      const refresh_token_verfiy = jwt.verify(user.refreshToken, secretKey) as {
        userId: string;
      };
      const payload = {
        userId: refresh_token_verfiy?.userId.toString(),
        email: user?.email,
      };

      if (refresh_token_verfiy) {
        const accessToken = jwt.sign(payload, secretKey, optionsForAccess);
        const refreshToken = jwt.sign(payload, secretKey, optionsForRefresh);

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();

        const data = {
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        return { status: true, data: data, message: 'success' };
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException(
          'Refresh Token has expired',
          HttpStatus.UNAUTHORIZED,
        );
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpException(
          'Invalid token format',
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw new HttpException(
          'Refresh Token verification failed',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
}
