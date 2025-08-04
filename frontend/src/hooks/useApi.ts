import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

// Custom hook for API calls with loading and error states
export function useApiCall<T>(
  apiFunction: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Hook for todos
export function useTodos() {
  return useApiCall(() => apiService.getTodos());
}

// Hook for single todo
export function useTodo(id: string) {
  return useApiCall(() => apiService.getTodo(id), [id]);
}

// Hook for properties
export function useProperties() {
  return useApiCall(() => apiService.getProperties());
}

// Hook for campaigns
export function useCampaigns() {
  return useApiCall(() => apiService.getCampaigns());
}

// Hook for LinkedIn posts
export function useLinkedInPosts() {
  return useApiCall(() => apiService.getLinkedInPosts());
}

// Hook for leads
export function useLeads() {
  return useApiCall(() => apiService.getLeads());
}

// Hook for dashboard stats
export function useDashboardStats() {
  return useApiCall(() => apiService.getDashboardStats());
}

// Hook for authentication
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
}