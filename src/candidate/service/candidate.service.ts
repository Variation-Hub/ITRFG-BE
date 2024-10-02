// candidate.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate } from '../../schemas/candidate.schema';
import { CandidateApiDto } from 'src/dtos/candidate.dto';
import { Request, response } from 'express';
import { RequestWithUser } from 'src/interface/global.interface';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { excludePassword } from 'src/utils/excludePassword';
import { LoginDto } from 'src/dtos/login.dto';
import { User } from 'src/schemas/user.schema';
const nodemailer = require('nodemailer');

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    @InjectModel(User.name) private userModel: Model<User>,

  ) {}

  async registerCandidate(
    candidateData: CandidateApiDto,
    request: RequestWithUser,
  ) {
    try {
      const findCandidate = await this.candidateModel.findOne({
        email: request.body.email,
      });

      if (findCandidate)
        throw new HttpException('Candidate Already Exist', HttpStatus.CONFLICT);

      // call auth service to create user
      const data = {
        type: 'register',
        userType: 'candidate',
        email: candidateData?.email,
      };
      const headers = {
        'Content-Type': 'application/json',
      };
      const url = `${process.env.SERVER_BASE_PATH}/auth/token`;
      console.log("kjskjdks", url)
      const userData = await axios.post(url, data, {
        headers: headers,
      });
      console.log("kkppolkjkjk")
      const userId = userData.data.data.userId;
      candidateData.userId = userId;
      // Hash the password with a salt
      const hashedPassword = await bcrypt.hash(candidateData.password, 10);
      // Save the hashed password to the candidateData
      candidateData.password = hashedPassword;

      const createdCandidate = new this.candidateModel(candidateData);
      await createdCandidate.save();
      const responseData = {
        userType: createdCandidate?.userType,
        email: createdCandidate?.email,
        fullName: createdCandidate?.fullName,
        accessToken: userData.data.data.accessToken,
        refreshToken: userData.data.data.refreshToken,
      };
        var transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        console.log("hkjkklklklk")
        const verifyurl = `${process.env.SERVER_BASE_PATH}/candidate/verify/token}`;
        console.log("SDfsfdgdfg")
        var mailOptions = {
          from: process.env.SMTP_USER,
          to: candidateData.email, // Use user's email for sending OTP
          subject: 'Welcome to ITRFG',
          text: `Your OTP for ITRFG is: ${verifyurl}`,
        };
        transporter.sendMail(
          mailOptions,
          function (error: any, info: { response: string }) {
            if (error) {
            } else {
              if (info.response) {
              }
              console.log("url sent")
              response.status(201).send({
                message:
                  'Url sent successfully. Please check your mail.',
                status: 1,
              });
            }
          },
        );      
      return { status: true, data: responseData, message: 'success' };
    } catch (error) {
      throw new HttpException(
        { message: error.message, status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCandidate(request: RequestWithUser) {
    try {
      const userId = request.userId;
      const candidate = await this.candidateModel.findOne({ userId }).exec();

      if (!candidate) {
        // Throw an exception if no candidate is found
        throw new NotFoundException('Candidate not found');
      }

      // Exclude the 'password' field from the response
      const responseData = excludePassword(candidate.toObject());

      return { status: true, data: responseData, message: 'success' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async loginCandidate(loginData: LoginDto, request: RequestWithUser) {
    try {
      const candidate = await this.candidateModel.findOne({
        email: loginData.email,
      });

      if (!candidate) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.BAD_REQUEST,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        candidate?.password,
      );

      if (!isPasswordValid) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.BAD_REQUEST,
        );
      }

      // call auth service to create user
      const data = {
        type: 'login',
        userType: 'candidate',
        email: candidate?.email,
      };
      const headers = {
        'Content-Type': 'application/json',
      };
      const url = `${process.env.SERVER_BASE_PATH}/auth/token`;

      const userData = await axios.post(url, data, {
        headers: headers,
      });
      if (candidate.email) {
        var transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        const verifyurl = `${process.env.SERVER_BASE_PATH}/candidate/verify/token`;
        var mailOptions = {
          from: process.env.SMTP_USER,
          to: data.email, // Use user's email for sending OTP
          subject: 'Welcome to ITRFG',
          text: `Click to verify your email: ${verifyurl}`,
        };
        transporter.sendMail(
          mailOptions,
          function (error: any, info: { response: string }) {
            if (error) {
            } else {
              if (info.response) {
              }
              response.status(201).send({
                message:
                  'OTP has been sent successfully. Please check your mail.',
                status: 1,
              });
            }
          },
        );
      }
      const responseData = {
        userType: candidate?.userType,
        email: candidate?.email,
        fullName: candidate?.fullName,
        accessToken: userData.data.data.accessToken,
        refreshToken: userData.data.data.refreshToken,
      };
      return { status: true, data: responseData, message: 'success' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async forgotPassword(request: RequestWithUser) {
    try {
      const email = request.body.email;
      const user = await this.candidateModel.findOne({
        where: { email: email },
      });
      if (user) {
        var transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        const verifyurl = `${process.env.SERVER_BASE_PATH}/candidate/verify/token`;
        var mailOptions = {
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Password Reset',
          Text: `Click to Reset Password: ${verifyurl}`,
        };
        transporter.sendMail(
          mailOptions,
          function (error: any, info: { response: string }) {
            if (error) {
            } else {
              if (info.response) {
              }
              response.status(201).send({
                message:
                  'OTP has been sent successfully. Please check your mail.',
                status: 1,
              });
            }
          },
        );
      } else {
        return {
          error: true,
          message: "E-mail doesn't exists",
        };
        // return { message: "E-mail doesn't exists" };
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
  async resetPassword(request: RequestWithUser) {
    try {
      const email = request.body.email;
      const newPassword = request.body.newPassword;
      const candidate = await this.candidateModel.findOne({
        where: { email: email },
      });
      if (candidate) {
        const validatePassword = await bcrypt.compare(
          newPassword,
          candidate.password,
        );
        if (validatePassword) {
          throw new HttpException(
            'Password cannot be same as before',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          // Save the hashed password to the candidateData
          candidate.password = hashedPassword;

          const createdCandidate = new this.candidateModel(candidate);
          await createdCandidate.save();
          return { message: 'Password changed successfully', status: 2 };
        }
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyEmail(request: RequestWithUser, token:string)
  {
    try {
      const user = await this.userModel.findOne({accessToken :token })
      if(!user)
      {
        throw new HttpException("Please register your email", HttpStatus.BAD_REQUEST)
      }
      return {message: 'candidate register successfully', user:user}
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST)
    }
  }
}
