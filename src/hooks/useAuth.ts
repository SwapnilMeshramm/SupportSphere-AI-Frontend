'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { user, token, isAuthenticated, hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (requireAuth && hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, hasHydrated, isAuthenticated, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: requireAuth && !hasHydrated,
    logout,
  };
}
