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

// Format date string to display format (DD/MM/YYYY)
export function formatDateToDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error('Failed to format date:', error);
    return dateString;
  }
}

// Format time string to display format (HH:MM AM/PM)
export function formatTimeToDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Failed to format time:', error);
    return '';
  }
}



