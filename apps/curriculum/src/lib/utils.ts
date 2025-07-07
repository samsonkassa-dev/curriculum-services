import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DecodedToken } from "@/types/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeJWT(token: string | null): DecodedToken | null {
  // Return null if token is null, undefined, or empty string
  if (!token) {
    return null;
  }
  
  try {
    const parts = token.split('.');
    
    // Check if token has three parts (header, payload, signature)
    if (parts.length !== 3) {
      return null;
    }
    
    const base64Url = parts[1];
    
    // Check if base64Url is valid
    if (!base64Url) {
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

// Format date string to display format (DD/MM/YYYY) in EAT timezone
export function formatDateToDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Convert to EAT (East Africa Time - UTC+3) using Intl.DateTimeFormat
    const eatFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Addis_Ababa', // EAT timezone
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return eatFormatter.format(date);
  } catch (error) {
    console.error('Failed to format date:', error);
    return dateString;
  }
}

// Format time string to display format (HH:MM AM/PM) in EAT timezone
export function formatTimeToDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Convert to EAT (East Africa Time - UTC+3) using Intl.DateTimeFormat
    const eatFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Addis_Ababa', // EAT timezone
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return eatFormatter.format(date);
  } catch (error) {
    console.error('Failed to format time:', error);
    return '';
  }
}



