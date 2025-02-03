"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';

const Banner = () => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 h-screen"> {/* Add a fixed height */}
  <Image 
    src="/images/image1.jpg"
    alt="Luxury perfumes"
    className="w-full h-full object-cover" // Use object-cover here
    width={1920} // Add width and height for better performance
    height={1080}
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

    
      </div>
    </div>
  );
};

export default Banner;