"use client"

import { motion } from 'framer-motion';

const Banner = () => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/banner-bg.jpg"
          alt="Luxury perfumes"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover Your Signature Scent
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our curated collection of luxury fragrances from the world's most prestigious perfume houses.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/men"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Shop Men's
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/women"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50"
            >
              Shop Women's
            </motion.a>
          </div>
        </motion.div>

        {/* Featured brands */}
        <div className="mt-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-1 flex justify-center">
              <img className="h-12 opacity-50" src="/brand1.png" alt="Brand" />
            </div>
            {/* Add more brand logos as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;