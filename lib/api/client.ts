// lib/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Use proxy endpoint to avoid SSL issues with IP addresses
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://165.227.182.17/api';
const BASE_URL = API_URL.includes('165.227.182.17') || process.env.NODE_ENV === 'development'
  ? '/api/proxy' 
  : API_URL;

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config:any) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const tenantId = localStorage.getItem('tenantId');
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 unauthorized
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/admin-login';
          }
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network Error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url);
  }
}

export const apiClient = new ApiClient();
