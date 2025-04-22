import { getCookie } from "@curriculum-services/auth";
import { api } from "../api";
import axios from "axios";

// TOKEN
export const TOKEN_KEY = 'token';
export const OLD_TOKEN_KEY = 'auth_token'; // for backward compatibility

/**
 * Get auth token from cookie
 */
export const getAuthToken = (): string | null => {
  return getCookie(TOKEN_KEY) || null;
};

/**
 * Creates an Authorization header with the token
 */
export const getAuthHeader = (): { Authorization: string } | Record<string, never> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get the API with Authorization header included
 */
export const getAuthorizedApiInstance = () => {
  // Just need a basic axios instance
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  });
};

/**
 * Redirects to login page
 */
export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const clearAuthData = async () => {
  try {
    // Clear localStorage first
    localStorage.clear();
    
    // Call logout endpoint and wait for it to complete
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Return success status
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false };
  } finally {
    // Always redirect, regardless of the outcome
    window.location.replace('/');
  }
};
