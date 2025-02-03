"use server";

import HomePageWrapper from '../components/HomePageWrapper';
import HomePageClient from '../components/HomePageClient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
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
  // Fetch the initial list of products from the database.
  const products = await getProducts();

  return (
    <HomePageWrapper products={products}>
      {/* Pass the initial products to the client component */}
      <HomePageClient initialProducts={products} />
    </HomePageWrapper>
  );
}
