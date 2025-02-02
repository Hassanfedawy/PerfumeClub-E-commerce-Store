'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname));
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router, pathname]);

  return {
    isAdmin: session?.user?.role === 'admin',
    isLoading: status === 'loading',
    user: session?.user
  };
}
