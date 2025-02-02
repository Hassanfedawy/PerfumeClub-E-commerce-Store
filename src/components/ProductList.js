'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Link from 'next/link';

const ProductList = ({ products, category }) => {
  const dispatch = useDispatch();
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  const filteredProducts = products
    .filter(product => selectedSeason === 'all' || product.season === selectedSeason)
    .filter(product => {
      if (priceRange === 'all') return true;
      const price = product.price;
      switch (priceRange) {
        case 'under100':
          return price < 100;
        case '100to200':
          return price >= 100 && price <= 200;
        case 'over200':
          return price > 200;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900">
          {category} Fragrances
        </h1>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="all">All Seasons</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="spring">Spring</option>
            <option value="fall">Fall</option>
          </select>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="all">All Prices</option>
            <option value="under100">Under $100</option>
            <option value="100to200">$100 - $200</option>
            <option value="over200">Over $200</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="featured">Featured</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link href={`/${category.toLowerCase()}/${product.id}`}>
              <div className="relative pb-[100%] cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {product.season && (
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                      {product.season}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/${category.toLowerCase()}/${product.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors duration-200">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-purple-600">
                  ${product.price}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
