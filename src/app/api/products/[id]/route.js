import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError, handleApiError } from '@/lib/apiError';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get a single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return NextResponse.json({
      ...product,
      avgRating,
      numReviews: product.reviews.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403 }
      );
    }

    const { id } = params;
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data
    });

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
