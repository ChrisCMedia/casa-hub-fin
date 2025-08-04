// API service for Casa Hub Backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://casa-hub-backend.onrender.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface CreateTodoData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
}

interface UpdateTodoData extends Partial<CreateTodoData> {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface CreateLinkedInPostData {
  content: string;
  hashtags: string[];
  scheduledDate?: string;
  campaignId?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // Todos
  async getTodos(): Promise<ApiResponse<any[]>> {
    return this.request('/todos');
  }

  async getTodo(id: string): Promise<ApiResponse<any>> {
    return this.request(`/todos/${id}`);
  }

  async createTodo(data: CreateTodoData): Promise<ApiResponse<any>> {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTodo(id: string, data: UpdateTodoData): Promise<ApiResponse<any>> {
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  async addTodoComment(todoId: string, content: string): Promise<ApiResponse<any>> {
    return this.request(`/todos/${todoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Properties
  async getProperties(): Promise<ApiResponse<any[]>> {
    return this.request('/properties');
  }

  async getProperty(id: string): Promise<ApiResponse<any>> {
    return this.request(`/properties/${id}`);
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<any[]>> {
    return this.request('/campaigns');
  }

  async getCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/campaigns/${id}`);
  }

  // LinkedIn Posts
  async getLinkedInPosts(): Promise<ApiResponse<any[]>> {
    return this.request('/linkedin/posts');
  }

  async createLinkedInPost(data: CreateLinkedInPostData): Promise<ApiResponse<any>> {
    return this.request('/linkedin/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLinkedInPost(id: string, data: Partial<CreateLinkedInPostData>): Promise<ApiResponse<any>> {
    return this.request(`/linkedin/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveLinkedInPost(id: string): Promise<ApiResponse<any>> {
    return this.request(`/linkedin/posts/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved: true }),
    });
  }

  // Leads
  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.request('/leads');
  }

  async getLead(id: string): Promise<ApiResponse<any>> {
    return this.request(`/leads/${id}`);
  }

  // Analytics
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/analytics/dashboard');
  }

  async getTodoOverview(): Promise<ApiResponse<any>> {
    return this.request('/analytics/todos');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return fetch(`${API_BASE_URL.replace('/api', '')}/health`)
      .then(res => res.json())
      .then(data => ({ success: true, data }))
      .catch(error => ({ 
        success: false, 
        error: error.message 
      }));
  }
}

export const apiService = new ApiService();
export default apiService;