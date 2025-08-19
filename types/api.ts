export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
  }
  
  export interface ApiError extends Error {
    status: number;
    data: any;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
  }
  