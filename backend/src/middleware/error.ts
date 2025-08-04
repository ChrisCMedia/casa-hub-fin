import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types/express';
import { logger } from '@/config/logger';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle known AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode: prismaStatus, message: prismaMessage } = handlePrismaError(error);
    statusCode = prismaStatus;
    message = prismaMessage;
    isOperational = true;
  }
  // Handle Prisma validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    isOperational = true;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }

  // Log error details
  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId,
    });
  } else {
    logger.warn('Operational error:', {
      message: error.message,
      statusCode,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack,
    }),
  });
};

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  switch (error.code) {
    case 'P2002':
      return {
        statusCode: 409,
        message: 'A record with this data already exists',
      };
    case 'P2014':
      return {
        statusCode: 400,
        message: 'Invalid relation data provided',
      };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Invalid reference to related record',
      };
    case 'P2025':
      return {
        statusCode: 404,
        message: 'Record not found',
      };
    case 'P2016':
      return {
        statusCode: 400,
        message: 'Query interpretation error',
      };
    case 'P2021':
      return {
        statusCode: 500,
        message: 'Table does not exist in database',
      };
    default:
      return {
        statusCode: 500,
        message: 'Database operation failed',
      };
  }
};

export const notFoundHandler = (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};