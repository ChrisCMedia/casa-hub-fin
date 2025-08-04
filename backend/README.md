# Casa Hub Backend API

A comprehensive real estate dashboard backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Property Management**: Full CRUD operations for real estate properties
- **Todo System**: Task management with comments, attachments, and assignments
- **Campaign Management**: Marketing campaign tracking with KPI monitoring
- **LinkedIn Integration**: Social media post management with approval workflow
- **Lead Management**: Lead tracking with scoring and property interests
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Real-time Updates**: WebSocket support for live notifications

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: Socket.IO for WebSocket connections
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston for structured logging

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Database setup**:
   ```bash
   npm run db:push      # Push schema to database
   npm run db:generate  # Generate Prisma client
   npm run db:seed      # Seed with sample data
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Properties
- `GET /api/properties` - List properties with filtering
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/images` - Add property image

### Todos
- `GET /api/todos` - List todos with filtering
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get todo details
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `POST /api/todos/:id/comments` - Add comment to todo

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/kpis` - Add KPI to campaign
- `PUT /api/campaigns/:id/kpis/:kpiId` - Update campaign KPI

### LinkedIn Posts
- `GET /api/linkedin` - List LinkedIn posts
- `POST /api/linkedin` - Create new post
- `GET /api/linkedin/:id` - Get post details
- `PUT /api/linkedin/:id` - Update post
- `POST /api/linkedin/:id/submit` - Submit for approval
- `POST /api/linkedin/:id/approve` - Approve/reject post
- `POST /api/linkedin/:id/schedule` - Schedule approved post

### Leads
- `GET /api/leads` - List leads with filtering
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `POST /api/leads/:id/properties` - Add property interest
- `PUT /api/leads/:id/score` - Update lead score

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/campaigns/:id` - Campaign analytics
- `GET /api/analytics/leads` - Lead analytics with trends

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Authentication and role management
- **Properties**: Real estate listings with images
- **Todos**: Task management with comments and attachments
- **Campaigns**: Marketing campaigns with KPI tracking
- **LinkedIn Posts**: Social media content with approval workflow
- **Leads**: Lead management with property interests
- **Notifications**: Real-time user notifications

## Authentication & Security

### JWT Tokens
- Access tokens: 24h expiration
- Refresh tokens: 7d expiration, stored in Redis
- Role-based access control (Admin, Editor, Guest)

### Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting per user
- Input validation and sanitization
- SQL injection prevention via Prisma

## Real-time Features

WebSocket connections handle:
- Live notifications
- Todo status updates  
- Campaign performance alerts
- Lead activity notifications

## Sample Data

Run the seed script to populate with sample data:

```bash
npm run db:seed
```

**Sample Users:**
- Admin: `admin@casahub.com` / `admin123!`
- Agent: `sarah@immobilien-weber.de` / `sarah123!`
- Marketing: `michael@marketing-pro.de` / `michael123!`

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
src/
├── config/          # Database, Redis, logger configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication, validation, error handling
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
├── scripts/         # Database seeding and migration scripts
└── server.ts        # Application entry point
```

## Deployment

### Environment Variables

Key environment variables for production:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/casahub
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
NODE_ENV=production
PORT=5000
```

### Production Setup

1. Set up PostgreSQL and Redis instances
2. Configure environment variables
3. Run database migrations
4. Build and start the application:

```bash
npm run build
npm start
```

### Health Check

The API includes a health check endpoint at `/health` that verifies:
- Database connectivity
- Redis connectivity
- Application uptime
- Service status

## API Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors are logged with contextual information and return user-friendly messages.

## Contributing

1. Follow TypeScript and ESLint configurations
2. Write tests for new features
3. Update documentation for API changes
4. Follow semantic commit messages

## Support

For support and questions, please refer to the project documentation or create an issue in the repository.