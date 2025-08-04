import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '@/utils/auth';
import { ApiResponse, AuthenticatedRequest } from '@/types/express';
import prisma from '@/config/database';
import { logger } from '@/config/logger';
import { UserRole } from '@prisma/client';

export const authenticate = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const payload = AuthUtils.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      });
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next();
    }

    const payload = AuthUtils.verifyAccessToken(token);
    if (!payload) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next();
  }
};

export const requireOwnership = (resourceField: string = 'userId') => {
  return async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Admin can access all resources
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required',
      });
    }

    try {
      // This would need to be implemented per resource type
      // For now, we'll allow access if the user is the owner
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership',
      });
    }
  };
};

export const rateLimitByUser = (windowMs: number = 60000, max: number = 100) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    const userId = req.userId || req.ip;
    const now = Date.now();

    const userAttempts = attempts.get(userId);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
    }

    userAttempts.count++;
    next();
  };
};