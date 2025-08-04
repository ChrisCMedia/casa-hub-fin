// Comprehensive type definitions for the Real Estate Dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'guest';
  avatar?: string;
  lastActive: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  dueDate: Date;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  mentions: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface LinkedInPost {
  id: string;
  content: string;
  mediaAttachments: Attachment[];
  hashtags: string[];
  scheduledDate?: Date;
  status: 'draft' | 'pending-approval' | 'approved' | 'scheduled' | 'published' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  publishedAt?: Date;
  analytics?: PostAnalytics;
  campaign?: string;
}

export interface PostAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clickThroughRate: number;
  engagement: number;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial' | 'land';
  price: number;
  area: number;
  rooms: number;
  status: 'available' | 'under-contract' | 'sold' | 'rented';
  images: string[];
  description: string;
  features: string[];
  listingDate: Date;
  agent: string;
}

export interface Campaign {
  id: string;
  name: string;
  propertyId?: string;
  type: 'social-media' | 'google-ads' | 'print' | 'event' | 'email';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  platforms: string[];
  kpis: CampaignKPI[];
  createdBy: string;
}

export interface CampaignKPI {
  metric: string;
  target: number;
  current: number;
  unit: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'viewing-scheduled' | 'offer-made' | 'closed' | 'lost';
  source: 'website' | 'social-media' | 'referral' | 'cold-call' | 'event';
  propertyInterest: string[];
  budget: { min: number; max: number };
  notes: string;
  lastContact: Date;
  score: number;
  assignedAgent: string;
}

export interface MarketingPartner {
  id: string;
  name: string;
  company: string;
  expertise: string[];
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  collaboration: {
    activeCampaigns: string[];
    completedProjects: number;
    rating: number;
    preferredChannels: string[];
  };
  dashboard: {
    todoCount: number;
    activeDeadlines: number;
    completionRate: number;
  };
}

export interface AIImpuls {
  id: string;
  type: 'content-idea' | 'promotion' | 'event' | 'targeting' | 'trend-alert';
  title: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  category: string;
  generatedAt: Date;
  status: 'new' | 'reviewing' | 'approved' | 'implemented' | 'dismissed';
  relatedProperty?: string;
  relatedCampaign?: string;
}

export interface Notification {
  id: string;
  type: 'todo-due' | 'approval-needed' | 'campaign-update' | 'lead-activity' | 'deadline-approaching';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface DashboardStats {
  todosOverview: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  campaignsOverview: {
    active: number;
    totalBudget: number;
    totalSpent: number;
    avgPerformance: number;
  };
  leadsOverview: {
    total: number;
    new: number;
    qualified: number;
    conversion: number;
  };
  socialMediaOverview: {
    scheduledPosts: number;
    pendingApproval: number;
    totalEngagement: number;
    followerGrowth: number;
  };
}