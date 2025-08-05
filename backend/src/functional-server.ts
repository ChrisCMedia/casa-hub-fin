import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error';
import prisma from '@/config/database';
import redis from '@/config/redis';
import { authenticate, authorize } from '@/middleware/auth';

// Import controllers directly
import { AuthController } from '@/controllers/auth.controller';
import { TodoController } from '@/controllers/todo.controller';
import { PropertyController } from '@/controllers/property.controller';
import { CampaignController } from '@/controllers/campaign.controller';
import { LinkedInController } from '@/controllers/linkedin.controller';
import { LeadController } from '@/controllers/lead.controller';
import { AnalyticsController } from '@/controllers/analytics.controller';

import { UserRole } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      message: 'Casa Hub Functional Backend is running'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

// Auth routes (no validation middleware for now)
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/refresh', AuthController.refreshToken);
app.get('/api/auth/me', authenticate, AuthController.getProfile);
app.put('/api/auth/profile', authenticate, AuthController.updateProfile);
app.put('/api/auth/password', authenticate, AuthController.changePassword);
app.delete('/api/auth/account', authenticate, AuthController.deleteAccount);

// Todo routes
app.get('/api/todos', authenticate, TodoController.getTodos);
app.get('/api/todos/:id', authenticate, TodoController.getTodo);
app.post('/api/todos', authenticate, TodoController.createTodo);
app.put('/api/todos/:id', authenticate, TodoController.updateTodo);
app.delete('/api/todos/:id', authenticate, TodoController.deleteTodo);
app.post('/api/todos/:id/comments', authenticate, TodoController.addComment);

// Property routes
app.get('/api/properties', authenticate, PropertyController.getProperties);
app.get('/api/properties/:id', authenticate, PropertyController.getProperty);
app.post('/api/properties', authenticate, authorize(UserRole.EDITOR, UserRole.ADMIN), PropertyController.createProperty);
app.put('/api/properties/:id', authenticate, PropertyController.updateProperty);
app.delete('/api/properties/:id', authenticate, authorize(UserRole.ADMIN), PropertyController.deleteProperty);
app.post('/api/properties/:id/images', authenticate, PropertyController.addImage);
app.put('/api/properties/:propertyId/images/:imageId', authenticate, PropertyController.updateImage);
app.delete('/api/properties/:propertyId/images/:imageId', authenticate, PropertyController.deleteImage);

// Campaign routes
app.get('/api/campaigns', authenticate, CampaignController.getCampaigns);
app.get('/api/campaigns/:id', authenticate, CampaignController.getCampaign);
app.post('/api/campaigns', authenticate, authorize(UserRole.EDITOR, UserRole.ADMIN), CampaignController.createCampaign);
app.put('/api/campaigns/:id', authenticate, CampaignController.updateCampaign);
app.delete('/api/campaigns/:id', authenticate, authorize(UserRole.ADMIN), CampaignController.deleteCampaign);
app.post('/api/campaigns/:id/kpis', authenticate, CampaignController.addKPI);
app.put('/api/campaigns/:campaignId/kpis/:kpiId', authenticate, CampaignController.updateKPI);
app.delete('/api/campaigns/:campaignId/kpis/:kpiId', authenticate, CampaignController.deleteKPI);

// LinkedIn routes
app.get('/api/linkedin/posts', authenticate, LinkedInController.getPosts);
app.get('/api/linkedin/posts/:id', authenticate, LinkedInController.getPost);
app.post('/api/linkedin/posts', authenticate, LinkedInController.createPost);
app.put('/api/linkedin/posts/:id', authenticate, LinkedInController.updatePost);
app.delete('/api/linkedin/posts/:id', authenticate, LinkedInController.deletePost);
app.put('/api/linkedin/posts/:id/approve', authenticate, authorize(UserRole.EDITOR, UserRole.ADMIN), LinkedInController.approvePost);
app.put('/api/linkedin/posts/:id/schedule', authenticate, LinkedInController.schedulePost);
app.post('/api/linkedin/posts/:id/media', authenticate, LinkedInController.addMedia);
app.put('/api/linkedin/posts/:id/analytics', authenticate, LinkedInController.updateAnalytics);

// Lead routes
app.get('/api/leads', authenticate, LeadController.getLeads);
app.get('/api/leads/:id', authenticate, LeadController.getLead);
app.post('/api/leads', authenticate, LeadController.createLead);
app.put('/api/leads/:id', authenticate, LeadController.updateLead);
app.delete('/api/leads/:id', authenticate, authorize(UserRole.ADMIN), LeadController.deleteLead);
app.post('/api/leads/:id/interests', authenticate, LeadController.addPropertyInterest);
app.delete('/api/leads/:leadId/interests/:propertyId', authenticate, LeadController.removePropertyInterest);
app.put('/api/leads/:id/score', authenticate, LeadController.updateScore);

// Analytics routes
app.get('/api/analytics/dashboard', authenticate, AnalyticsController.getDashboardStats);
app.get('/api/analytics/campaigns/:id', authenticate, AnalyticsController.getCampaignAnalytics);
app.get('/api/analytics/social-media', authenticate, AnalyticsController.getSocialMediaAnalytics);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('socketio', io);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Connected to database');

    // Test Redis connection (with error handling)
    try {
      await redis.ping();
      logger.info('Connected to Redis');
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis:', redisError);
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`Functional server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  await prisma.$disconnect();
  logger.info('Database connection closed');

  try {
    redis.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.warn('Redis disconnect error:', error);
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  await prisma.$disconnect();
  logger.info('Database connection closed');

  try {
    redis.disconnect();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.warn('Redis disconnect error:', error);
  }

  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export { app, server, io };