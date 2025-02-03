"use server"

import Footer from '../components/Footer';
import Banner from '../components/Banner';
import FeaturedProducts from '../components/FeaturedProducts';
import HomePageWrapper from '../components/HomePageWrapper';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const bestSellingProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <HomePageWrapper products={products}>
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
    </HomePageWrapper>
  );
}