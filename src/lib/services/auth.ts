/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthResponse, LoginCredentials, Session, User, DecodedToken, LoginResponse } from "@/types/auth";

class AuthService {
  private baseUrl = '/api/auth';
  private tokenKey = 'auth_token';
  private roleKey = 'user_role';

  private decodeJWT(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded: DecodedToken = JSON.parse(jsonPayload);
      
      return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        isProfileFilled: decoded.isProfileFilled,
        isFirstTimeLogin: false
      };
    } catch (error) {
      console.log('Failed to decode JWT:', error);
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.setTokens(data.token, data.role);

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      token: data.token,
      isFirstTimeLogin: data.isFirstTimeLogin                           
    };
  }

  async googleLogin(googleToken: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google login failed');
    }

    const data = await response.json();
    this.setTokens(data.token, data.role);

    // Set cookie with correct name that middleware checks
    document.cookie = `token=${data.token}; path=/; secure; samesite=lax`;

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      token: data.token,
      isFirstTimeLogin: false
    };
  }

  async getSession(): Promise<Session | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedUser = this.decodeJWT(token);
      if (!decodedUser) {
        this.clearTokens();
        return null;
      }

      return {
        user: decodedUser,
        accessToken: token
      };
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Clear the cookie on logout
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  private setTokens(token: string, role: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }
}

export const authService = new AuthService(); 