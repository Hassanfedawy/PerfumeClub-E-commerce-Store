'use client';

import Header from '@/components/Header';
import { useState } from 'react';

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
