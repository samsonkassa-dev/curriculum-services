// JWT utilities for token handling
interface DecodedToken {
    sub: string;
    email: string;
    role: string;
    isProfileFilled?: boolean;
    companyProfileId?: string;
    profileStatus?: string;
    exp?: number;
    iat?: number;
  }
  
  export function decodeJWT(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }
  
  export function isTokenExpired(decoded: DecodedToken): boolean {
    if (!decoded.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }