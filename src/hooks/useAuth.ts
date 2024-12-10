// "use client"
// import { useAuthStore } from '@/lib/stores/auth-store';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export function useAuth(requireAuth = true) {
//     const user = useAuthStore((state) => state.user);
//     const router = useRouter();

//     // useEffect(() => {
//     //     if (requireAuth && !user) {
//     //         router.push('/');
//     //     }
//     //     if (!requireAuth && user) {
//     //         router.push('/dashboard');
//     //     }
//     // }, [user, requireAuth, router]);

//     return { user };
// } 