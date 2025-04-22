export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  isFirstTimeLogin?: boolean;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    }
  };
  message?: string;
} 