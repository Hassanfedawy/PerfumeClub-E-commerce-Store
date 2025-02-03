"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/image1.jpg"
          alt="Luxury perfumes"
          className="object-cover object-center"
          fill
          priority // Ensures the image is loaded as a priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Responsive heading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-6xl">
            Discover Your Signature Scent
          </h1>
          {/* Responsive paragraph */}
          <p className="mt-4 text-lg text-gray-300 sm:mt-6 sm:text-xl max-w-3xl mx-auto">
            Explore our curated collection of luxury fragrances from the world's
            most prestigious perfume houses.
          </p>
          {/* Responsive buttons */}
          <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
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
