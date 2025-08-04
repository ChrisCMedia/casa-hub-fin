import { User } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: User;
  userId: string;
}