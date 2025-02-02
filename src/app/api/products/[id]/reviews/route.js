import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/apiError';

// Get reviews for a product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create a new review
export async function POST(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw ApiError.unauthorized();
    }

    const { id } = params;
    const { rating, comment } = await request.json();

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: token.sub,
          productId: id,
        },
      },
    });

    if (existingReview) {
      throw ApiError.badRequest('You have already reviewed this product');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: token.sub,
        productId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update product average rating and review count
    const productReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avgRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        avgRating,
        numReviews: productReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a review
export async function PUT(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw ApiError.unauthorized();
    }

    const { id } = params;
    const { rating, comment } = await request.json();

    const review = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: token.sub,
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const updatedReview = await prisma.review.update({
      where: { id: review.id },
      data: { rating, comment },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update product average rating
    const productReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avgRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;

    await prisma.product.update({
      where: { id },
      data: { avgRating },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a review
export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      throw ApiError.unauthorized();
    }

    const { id } = params;

    const review = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: token.sub,
      },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    await prisma.review.delete({
      where: { id: review.id },
    });

    // Update product average rating and review count
    const productReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avgRating = productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : 0;

    await prisma.product.update({
      where: { id },
      data: {
        avgRating,
        numReviews: productReviews.length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
