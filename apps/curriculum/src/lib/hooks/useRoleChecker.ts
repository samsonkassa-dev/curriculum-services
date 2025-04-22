"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@curriculum-services/auth";
import { getCookie } from "@curriculum-services/auth";

export function useRoleChecker() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // First try to get the role from auth context
    if (user?.role) {
      console.log('useRoleChecker: Got role from auth context:', user.role);
      setUserRole(user.role);
      return;
    }
    
    // Second, try to get from direct role cookie
    const roleCookie = getCookie("user_role");
    if (roleCookie) {
      console.log('useRoleChecker: Got role from direct cookie:', roleCookie);
      setUserRole(roleCookie);
      return;
    }
    
    // Third, fallback to token if auth context doesn't have the role
    const token = getCookie("token");
    if (token) {
      try {
        // Parse JWT payload
        const payload = token.split('.')[1];
        if (payload) {
          const decoded = JSON.parse(atob(payload));
          if (decoded?.role) {
            console.log('useRoleChecker: Extracted role from JWT token:', decoded.role);
            setUserRole(decoded.role);
          } else {
            console.warn('useRoleChecker: No role found in JWT token');
          }
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    } else {
      console.warn('useRoleChecker: No token found in cookies');
    }
    
    // Last resort: check cookies directly from document.cookie
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        console.log('useRoleChecker: All cookies:', cookies.map(c => c.trim()).join(', '));
        
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'user_role' && value) {
            console.log('useRoleChecker: Found user_role directly in document.cookie:', value);
            setUserRole(value);
            return;
          }
        }
      }
    } catch (error) {
      console.error('useRoleChecker: Error checking cookies directly:', error);
    }
  }, [user]);

  return { userRole };
}
