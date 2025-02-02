'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    }));
    toast.success('Added to cart');
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/${product.category}/${product.id}`}>
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          </div>
          <p className="text-lg font-medium text-gray-900">${product.price}</p>
        </div>
        
        <div className="mt-2 flex items-center space-x-2">
          <StarRating rating={product.avgRating || 0} size="sm" />
          <span className="text-sm text-gray-500">
            ({product.numReviews || 0})
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}