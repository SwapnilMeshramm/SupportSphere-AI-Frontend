'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  return { user, token, isAuthenticated, logout };
}
