import { useAuthStore } from './stores/auth-store';
import { decodeJWT } from './utils';

export const signInWithEmail = async (email: string, password: string) => {
  const { setLoading, setError, setToken, setRefreshToken, setUser } = useAuthStore.getState();
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Login failed');
    }

    // Access tokens from the nested data property
    const { accessToken, refreshToken } = responseData.data;

    setToken(accessToken);
    setRefreshToken(refreshToken);

    // Decode token to get user info including role
    const decodedToken = decodeJWT(accessToken);
    console.log('Decoded Token:', decodedToken); // For debugging

    if (decodedToken) {
      setUser({
        id: decodedToken.sub,
        email: decodedToken.email,
        role: decodedToken.role
      });
    }

  } catch (error) {
    setError(error instanceof Error ? error.message : 'Login failed');
    throw error;
  } finally {
    setLoading(false);
  }
};

export const googleSignIn = async (token: string) => {
  const { setLoading, setError, setUser, setToken } = useAuthStore.getState();
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Google login failed');
    }

    setUser(data.user);
    setToken(data.token);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Google login failed');
    throw error;
  } finally {
    setLoading(false);
  }
};

export const signOut = () => {
  useAuthStore.getState().reset();
};