export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  isFirstTimeLogin: boolean;
}

export interface ApiError {
  error?: string;
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

export interface GoogleLoginResponse {
  message: string;
  token: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isProfileFilled: boolean;
  companyId?: string;
  isFirstTimeLogin: boolean;
  roleColorCode?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  email: string;
  code: string;
  isFirstTimeLogin: boolean;
}

export interface DecodedToken {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isProfileFilled: boolean;
  companyProfileId?: string;
  exp: number;
  profileStatus?: string;
}

export interface Session {
  user: User;
  accessToken: string;
} 