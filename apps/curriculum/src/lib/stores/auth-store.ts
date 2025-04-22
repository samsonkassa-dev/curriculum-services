// import { create } from 'zustand';
// import { decodeJWT } from '@/lib/utils';

// interface User {
//   id: string;
//   email: string;
//   role?: string;
// }

// interface AuthState {
//   user: User | null;
//   refreshToken: string | null;
//   token: string | null;
//   isLoading: boolean;
//   error: string | null;
//   setUser: (user: User | null) => void;
//   setRefreshToken: (refreshToken: string | null) => void;
//   setToken: (token: string | null) => void;
//   setError: (error: string | null) => void;
//   setLoading: (isLoading: boolean) => void;
//   getUserRole: () => string | null;
//   reset: () => void;
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   token: null,
//   refreshToken: null,
//   isLoading: false,
//   error: null,
//   setUser: (user) => set({ user }),
//   setToken: (token) => set({ token }),
//   setRefreshToken: (refreshToken) => set({ refreshToken }),
//   setError: (error) => set({ error }),
//   setLoading: (isLoading) => set({ isLoading }),
//   getUserRole: () => {
//     const token = get().token;
//     if (!token) return null;
    
//     const decoded = decodeJWT(token);
//     return decoded?.role || null;
//   },
//   reset: () => set({ user: null, token: null, refreshToken: null, error: null }),
// })); 