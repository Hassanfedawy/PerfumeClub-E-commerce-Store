'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/cartSlice';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ params }) {
  const { id } = params;
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data);
      
      // Fetch related products
      const relatedResponse = await fetch(`/api/products?category=${data.category}&limit=4&exclude=${id}`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedProducts(relatedData.products);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      quantity,
    }));
    toast.success('Added to cart');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li>
            <button onClick={() => router.push('/')} className="hover:text-purple-600">
              Home
            </button>
          </li>
          <li>/</li>
          <li>
            <button onClick={() => router.push(`/${product.category}`)} className="hover:text-purple-600">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-96 bg-white rounded-lg shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 rounded-lg"
            priority
          />
        </div>

        <div>
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {product.stock > 0 ? (
                <p className="text-green-600">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-600">Out of Stock</p>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex items-center space-x-4 mb-6">
              <label className="text-gray-600">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={product.stock === 0}
              >
                {[...Array(Math.min(10, product.stock || 0))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 px-6 rounded-md text-white font-medium 
                ${product.stock > 0
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{relatedProduct.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 font-medium">
                      ${relatedProduct.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => router.push(`/${relatedProduct.category}/${relatedProduct.id}`)}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
