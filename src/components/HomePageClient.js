"use client";

import { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';

export default function HomePageClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);

  // Function to fetch the latest products from your API endpoint
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data?.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch products on mount and then poll every 60 seconds for updates.
  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Split products into Best Sellers and New Arrivals sections.
  const bestSellingProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div className="min-h-screen">
      <Banner />

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Best Sellers
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Our most popular fragrances loved by customers worldwide
          </p>
        </div>
        <FeaturedProducts products={bestSellingProducts} />
      </section>

      {/* New Arrivals Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Discover our latest additions to the collection
            </p>
          </div>
          <FeaturedProducts products={newArrivals} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
