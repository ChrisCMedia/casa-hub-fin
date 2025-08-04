import { Request, Response } from 'express';
import { AuthUtils } from '@/utils/auth';
import { createSuccessResponse, createErrorResponse, asyncHandler } from '@/utils/helpers';
import { ApiResponse, AuthenticatedRequest } from '@/types/express';
import prisma from '@/config/database';
import { logger } from '@/config/logger';
import { AppError } from '@/middleware/error';
import redis from '@/config/redis';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'EDITOR' | 'GUEST';
}

interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthController {
  static login = asyncHandler(async (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token pair
    const tokens = AuthUtils.generateTokenPair(user);

    // Store refresh token in Redis with expiration
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json(createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        lastActive: user.lastActive,
      },
      tokens,
    }, 'Login successful'));
  });

  static register = asyncHandler(async (req: Request<{}, ApiResponse, RegisterRequest>, res: Response<ApiResponse>) => {
    const { name, email, password, role = 'GUEST' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
    });

    // Generate token pair
    const tokens = AuthUtils.generateTokenPair(user);

    // Store refresh token in Redis
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    logger.info('User registered', { userId: user.id, email: user.email });

    res.status(201).json(createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        lastActive: user.lastActive,
      },
      tokens,
    }, 'Registration successful'));
  });

  static refreshToken = asyncHandler(async (req: Request<{}, ApiResponse, RefreshTokenRequest>, res: Response<ApiResponse>) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const payload = AuthUtils.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${payload.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new token pair
    const tokens = AuthUtils.generateTokenPair(user);

    // Update refresh token in Redis
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken);

    res.json(createSuccessResponse({
      tokens,
    }, 'Token refreshed successfully'));
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const userId = req.userId;

    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);

    logger.info('User logged out', { userId });

    res.json(createSuccessResponse(null, 'Logout successful'));
  });

  static me = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const user = req.user;

    res.json(createSuccessResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
    }));
  });

  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await AuthUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens for this user
    await redis.del(`refresh_token:${userId}`);

    logger.info('Password changed', { userId });

    res.json(createSuccessResponse(null, 'Password changed successfully'));
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { name, avatarUrl } = req.body;
    const userId = req.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
        updatedAt: new Date(),
      },
    });

    res.json(createSuccessResponse({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
      lastActive: updatedUser.lastActive,
    }, 'Profile updated successfully'));
  });

  static deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { password } = req.body;
    const userId = req.userId;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Password is incorrect', 400);
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);

    logger.info('User account deleted', { userId, email: user.email });

    res.json(createSuccessResponse(null, 'Account deleted successfully'));
  });
}