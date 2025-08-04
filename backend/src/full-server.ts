import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Casa Hub Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Todo routes
app.get('/api/todos', authenticateToken, async (req: any, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { createdBy: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: todos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/todos', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: req.user.userId,
      },
    });
    res.json({ success: true, data: todo });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/todos/:id', authenticateToken, async (req: any, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: { 
        id: req.params.id,
        createdBy: req.user.userId 
      }
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ success: true, data: todo });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const todo = await prisma.todo.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.json({ success: true, data: todo });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req: any, res) => {
  try {
    await prisma.todo.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Todo deleted' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LinkedIn routes
app.get('/api/linkedin/posts', authenticateToken, async (req: any, res) => {
  try {
    const posts = await prisma.linkedInPost.findMany({
      where: { createdBy: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get LinkedIn posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/linkedin/posts', authenticateToken, async (req: any, res) => {
  try {
    const { content, scheduledFor, tags } = req.body;
    const post = await prisma.linkedInPost.create({
      data: {
        content,
        scheduledDate: scheduledFor ? new Date(scheduledFor) : null,
        hashtags: tags || [],
        createdBy: req.user.userId,
      },
    });
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Create LinkedIn post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/linkedin/posts/:id/approve', authenticateToken, async (req: any, res) => {
  try {
    const post = await prisma.linkedInPost.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Approve LinkedIn post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics routes
app.get('/api/analytics/stats', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    const [totalTodos, completedTodos, totalPosts, activeCampaigns] = await Promise.all([
      prisma.todo.count({ where: { createdBy: userId } }),
      prisma.todo.count({ where: { createdBy: userId, status: 'COMPLETED' } }),
      prisma.linkedInPost.count({ where: { createdBy: userId } }),
      prisma.campaign.count({ where: { createdBy: userId, status: 'ACTIVE' } })
    ]);

    res.json({
      success: true,
      data: {
        totalTodos,
        completedTodos,
        totalPosts,
        activeCampaigns,
        completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and create test user
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log('Connected to database');

    // Create test user if it doesn't exist
    const testEmail = 'test@casahub.com';
    const existingUser = await prisma.user.findUnique({ where: { email: testEmail } });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hashedPassword,
          name: 'Test User',
        },
      });
      console.log('Test user created: test@casahub.com / password123');
    } else {
      console.log('Test user already exists: test@casahub.com / password123');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

export default app;