'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
  </div>
);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname));
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [session, status, router, pathname]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-100">


      {/* Main Content */}
      <main className={`mx-auto transition-all duration-300 ease-in-out`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
