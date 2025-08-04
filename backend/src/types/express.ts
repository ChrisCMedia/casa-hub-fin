import { User } from '@prisma/client';

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
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

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TodoFilters extends PaginationQuery {
  status?: string;
  priority?: string;
  assignedTo?: string;
  tags?: string;
  dueDate?: string;
}

export interface PropertyFilters extends PaginationQuery {
  type?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  agent?: string;
}

export interface CampaignFilters extends PaginationQuery {
  status?: string;
  type?: string;
  property?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadFilters extends PaginationQuery {
  status?: string;
  source?: string;
  assignedAgent?: string;
  minScore?: string;
  maxScore?: string;
}