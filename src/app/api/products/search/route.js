import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/apiError';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || Number.MAX_SAFE_INTEGER;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;

    const where = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        { price: { gte: minPrice, lte: maxPrice } },
      ],
    };

    if (category) {
      where.AND.push({ category });
    }

    if (type) {
      where.AND.push({ type });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        limit,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      const { reviews, ...rest } = product;
      return {
        ...rest,
        avgRating,
        numReviews: product.reviews.length,
      };
    });

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
