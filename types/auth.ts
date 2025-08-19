export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
  }
  