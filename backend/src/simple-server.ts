import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Enhanced Casa Hub Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Casa Hub Backend API',
    version: '1.0.0',
    features: ['Authentication', 'Todos', 'Properties', 'Campaigns', 'LinkedIn', 'Leads', 'Analytics']
  });
});

// Mock API endpoints for testing
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Test User',
        email: req.body.email,
        role: 'EDITOR'
      }
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'Test User',
      email: 'test@casahub.com',
      role: 'EDITOR'
    }
  });
});

app.get('/api/todos', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Sample Todo',
        description: 'This is a sample todo item',
        priority: 'MEDIUM',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/properties', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Sample Property',
        address: 'Musterstraße 1, Berlin',
        type: 'APARTMENT',
        price: 500000,
        area: 85,
        rooms: 3,
        status: 'AVAILABLE'
      }
    ]
  });
});

app.get('/api/campaigns', (req, res) => {
  res.json({
    success:true,
    data: [
      {
        id: '1',
        name: 'Sample Campaign',
        type: 'SOCIAL_MEDIA',
        status: 'ACTIVE',
        budget: 1000,
        spent: 250
      }
    ]
  });
});

app.get('/api/linkedin/posts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        content: 'Sample LinkedIn post about real estate',
        hashtags: ['#realestate', '#berlin'],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Max Mustermann',
        email: 'max@example.com',
        phone: '+49 123 456789',
        status: 'NEW',
        source: 'WEBSITE'
      }
    ]
  });
});

app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      todoOverview: {
        total: 10,
        pending: 5,
        inProgress: 3,
        completed: 2
      },
      campaignsOverview: {
        active: 3,
        totalBudget: 5000,
        totalSpent: 1500
      },
      leadsOverview: {
        total: 25,
        new: 8,
        qualified: 12,
        conversion: 20
      },
      socialMediaOverview: {
        scheduledPosts: 5,
        pendingApproval: 2,
        totalEngagement: 1250
      }
    }
  });
});

// Catch all other API routes
app.use('/api/*', (req, res) => {
  res.status(501).json({
    success: false,
    message: `API endpoint ${req.method} ${req.path} is not yet implemented in simple server mode`,
    note: 'This is a simplified server for testing. Full functionality will be available after TypeScript compilation issues are resolved.'
  });
});

app.listen(PORT, () => {
  console.log(`Enhanced Simple Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /health');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/me');
  console.log('- GET /api/todos');
  console.log('- GET /api/properties');
  console.log('- GET /api/campaigns');
  console.log('- GET /api/linkedin/posts');
  console.log('- GET /api/leads');
  console.log('- GET /api/analytics/dashboard');
});