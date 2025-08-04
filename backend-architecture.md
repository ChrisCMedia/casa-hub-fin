# Real Estate Dashboard Backend Architecture

## Technology Stack

### Core Framework
- **Node.js** with **Express.js** for API server
- **TypeScript** for type safety
- **PostgreSQL** as primary database
- **Redis** for caching and sessions
- **JWT** for authentication

### Additional Services
- **Prisma ORM** for database management
- **Socket.io** for real-time notifications
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Bull Queue** for background jobs

## Database Schema Design

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'guest',
    avatar_url TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Properties
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type property_type NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    area DECIMAL(8,2) NOT NULL,
    rooms INTEGER NOT NULL,
    status property_status NOT NULL DEFAULT 'available',
    description TEXT,
    features TEXT[],
    listing_date DATE NOT NULL,
    agent_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Todos
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority todo_priority NOT NULL DEFAULT 'medium',
    status todo_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Campaigns
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    property_id UUID REFERENCES properties(id),
    type campaign_type NOT NULL,
    status campaign_status NOT NULL DEFAULT 'planning',
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_audience TEXT,
    platforms TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### LinkedIn Posts
```sql
CREATE TABLE linkedin_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    hashtags TEXT[],
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status post_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    campaign_id UUID REFERENCES campaigns(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Leads
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status lead_status NOT NULL DEFAULT 'new',
    source lead_source NOT NULL,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    notes TEXT,
    last_contact TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    assigned_agent UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

### Users Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Properties
- `GET /api/properties` - List properties (with filters)
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Todo Management
- `GET /api/todos` - List todos (with filters)
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get todo details
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `POST /api/todos/:id/comments` - Add comment

### Campaign Management
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/kpis` - Get campaign KPIs

### LinkedIn Posts
- `GET /api/linkedin/posts` - List posts
- `POST /api/linkedin/posts` - Create post
- `GET /api/linkedin/posts/:id` - Get post details
- `PUT /api/linkedin/posts/:id` - Update post
- `POST /api/linkedin/posts/:id/approve` - Approve post
- `POST /api/linkedin/posts/:id/publish` - Publish post

### Leads Management
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics & KPIs
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/campaigns/:id` - Campaign analytics
- `GET /api/analytics/posts/:id` - Post analytics
- `GET /api/analytics/leads` - Lead analytics

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### File Management
- `POST /api/files/upload` - Upload files
- `GET /api/files/:id` - Get file
- `DELETE /api/files/:id` - Delete file

## Real-time Features

### WebSocket Events
- `notification:new` - New notification
- `todo:updated` - Todo status changed
- `post:approved` - LinkedIn post approved
- `lead:new` - New lead created
- `campaign:status` - Campaign status update

## Security Implementation

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization

### Data Security
- Password hashing with bcrypt
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- File upload restrictions

## Performance Optimizations

### Caching Strategy
- Redis for session storage
- API response caching
- Database query optimization
- Static file CDN integration

### Background Processing
- Email notifications
- Analytics data aggregation
- Scheduled social media posts
- Lead scoring updates

## Monitoring & Logging

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- API endpoint metrics
- Database query monitoring

### Logging Strategy
- Structured logging with Winston
- Request/response logging
- Error logging with stack traces
- Audit logging for sensitive operations

## Development & Deployment

### Development Setup
- Docker containerization
- Hot reload with nodemon
- TypeScript compilation
- Database migrations

### Production Deployment
- Environment-based configuration
- Health check endpoints
- Graceful shutdown handling
- Load balancer ready

This architecture provides a robust, scalable foundation for the real estate dashboard with comprehensive project management, KPI tracking, and marketing collaboration features.