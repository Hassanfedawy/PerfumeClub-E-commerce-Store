'use client';

import Header from '@/components/Header';
import SeasonFilter from '@/components/SeasonFilter';
import { useState } from 'react';

export default function ShopLayout({ children }) {
  const [selectedSeason, setSelectedSeason] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          <SeasonFilter selectedSeason={selectedSeason} onSeasonChange={setSelectedSeason} />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
