'use client';

import Header from '@/components/Header';

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-6">{children}</main>
    </div>
  );
}
