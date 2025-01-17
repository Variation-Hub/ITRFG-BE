import { Request } from 'express';

export interface RequestWithUser extends Request {
  email: string;
  userId: string;
}
