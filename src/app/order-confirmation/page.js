'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { clearCart } from '../../redux/cartSlice';

export default function OrderConfirmationPage() {
  const dispatch = useDispatch();
  const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  useEffect(() => {
    // Clear the cart after successful order
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Thank You for Your Order!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your order has been successfully placed.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-4">
              Our team will contact you shortly to confirm your order and arrange delivery.
            </p>
            <p>
              If you have any questions about your order, please contact our customer service.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              View Order History
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
