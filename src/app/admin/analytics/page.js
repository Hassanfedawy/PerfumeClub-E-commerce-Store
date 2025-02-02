'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      </div>
      <div className="p-3 bg-purple-100 rounded-full">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
    </div>
  </motion.div>
);

const Chart = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="h-64 flex items-end justify-between space-x-2">
      {children}
    </div>
  </div>
);

const ChartBar = ({ height, label, value }) => (
  <div className="flex flex-col items-center">
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: `${height}%` }}
      className="w-8 bg-purple-600 rounded-t"
    />
    <p className="mt-2 text-sm text-gray-600">{label}</p>
    <p className="text-xs text-gray-500">${value}</p>
  </div>
);

const TopProducts = ({ products }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">{product.sales} sales</p>
          </div>
          <p className="text-sm font-medium text-gray-900">${product.revenue}</p>
        </div>
      ))}
    </div>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="flex-shrink-0">
            <span className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-green-100' : 'bg-blue-100'}`}>
              {activity.type === 'order' ? '🛍️' : '👤'}
            </span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  
  const salesData = [
    { day: 'Mon', value: 2500 },
    { day: 'Tue', value: 3200 },
    { day: 'Wed', value: 2800 },
    { day: 'Thu', value: 4200 },
    { day: 'Fri', value: 3800 },
    { day: 'Sat', value: 4800 },
    { day: 'Sun', value: 4100 },
  ];

  const maxValue = Math.max(...salesData.map(d => d.value));

  const topProducts = [
    {
      id: 1,
      name: 'Blue de Chanel',
      sales: 124,
      revenue: 16740,
      image: '/images/perfumes/men/blue-de-chanel.jpg',
    },
    {
      id: 2,
      name: 'Dior Sauvage',
      sales: 98,
      revenue: 15190,
      image: '/images/perfumes/men/dior-sauvage.jpg',
    },
    {
      id: 3,
      name: 'Chanel N°5',
      sales: 87,
      revenue: 14355,
      image: '/images/perfumes/women/chanel-n5.jpg',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #12345 from John Doe',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'user',
      message: 'New user registration: jane@example.com',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'order',
      message: 'Order #12344 has been delivered',
      time: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$48,250"
          change={12.5}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          title="Total Orders"
          value="384"
          change={8.2}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
        />
        <StatCard
          title="Total Customers"
          value="1,248"
          change={-2.4}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
        />
        <StatCard
          title="Avg. Order Value"
          value="$125"
          change={5.8}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart title="Revenue Over Time">
          {salesData.map((data) => (
            <ChartBar
              key={data.day}
              height={(data.value / maxValue) * 100}
              label={data.day}
              value={data.value}
            />
          ))}
        </Chart>
        <TopProducts products={topProducts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Men's Fragrances</span>
                <span className="text-sm font-medium text-gray-900">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '58%' }}
                  className="bg-purple-600 h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Women's Fragrances</span>
                <span className="text-sm font-medium text-gray-900">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  className="bg-purple-600 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
}
