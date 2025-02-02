'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useProtectedRoute(options = { adminOnly: false }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/auth/signin');
      return;
    }

    if (options.adminOnly && session.user.role !== 'admin') {
      router.replace('/');
      return;
    }
  }, [session, status, router, options.adminOnly]);

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
  };
}
