'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

const ProductDetails = ({ product }) => {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);

  const sizes = [
    { value: '30ml', label: '30ml', price: product.price * 0.4 },
    { value: '50ml', label: '50ml', price: product.price * 0.7 },
    { value: '100ml', label: '100ml', price: product.price },
  ];

  const handleAddToCart = () => {
    const selectedSizeObj = sizes.find(size => size.value === selectedSize);
    dispatch(addToCart({
      id: `${product.id}-${selectedSize}`,
      name: product.name,
      price: selectedSizeObj.price,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
    }));
  };

  const selectedSizePrice = sizes.find(size => size.value === selectedSize)?.price || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              {product.season}
            </span>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Size</h2>
            <div className="grid grid-cols-3 gap-4">
              {sizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`p-4 text-center rounded-lg border ${
                    selectedSize === size.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-600'
                  }`}
                >
                  <div className="font-medium">{size.label}</div>
                  <div className="text-sm text-gray-500">${size.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-md border border-gray-300 hover:border-purple-600"
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-md border border-gray-300 hover:border-purple-600"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Season: {product.season}</li>
              <li>• Gender: {product.category}</li>
              <li>• Fragrance Family: {product.fragranceFamily || 'Not specified'}</li>
              <li>• Top Notes: {product.topNotes || 'Not specified'}</li>
            </ul>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-purple-600">
                ${(selectedSizePrice * quantity).toFixed(2)}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Add to Cart
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
