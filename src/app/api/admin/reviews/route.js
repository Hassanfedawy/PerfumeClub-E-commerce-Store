import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let where = {};
    
    if (status) {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              averageRating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Get review statistics
    const stats = await prisma.review.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      statistics: {
        statuses: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Update review status (approve/reject)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, moderationComment } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Review ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        status,
        moderationComment,
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            averageRating: true,
          },
        },
      },
    });

    // Update product average rating if review status changed
    if (status === 'APPROVED' || status === 'REJECTED') {
      const approvedReviews = await prisma.review.findMany({
        where: {
          productId: review.productId,
          status: 'APPROVED',
        },
        select: { rating: true },
      });

      const avgRating = approvedReviews.length
        ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) /
          approvedReviews.length
        : 0;

      await prisma.product.update({
        where: { id: review.productId },
        data: { averageRating: avgRating },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Bulk update reviews
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, status, moderationComment } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: 'Review IDs and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update all reviews
    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        moderationComment,
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
      },
    });

    // Get affected products
    const reviews = await prisma.review.findMany({
      where: { id: { in: ids } },
      select: { productId: true },
      distinct: ['productId'],
    });

    // Update average ratings for all affected products
    await Promise.all(
      reviews.map(async ({ productId }) => {
        const approvedReviews = await prisma.review.findMany({
          where: {
            productId,
            status: 'APPROVED',
          },
          select: { rating: true },
        });

        const avgRating = approvedReviews.length
          ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) /
            approvedReviews.length
          : 0;

        await prisma.product.update({
          where: { id: productId },
          data: { averageRating: avgRating },
        });
      })
    );

    return NextResponse.json({
      message: `Successfully updated ${ids.length} reviews`,
    });
  } catch (error) {
    console.error('Error bulk updating reviews:', error);
    return NextResponse.json(
      { error: 'Failed to update reviews' },
      { status: 500 }
    );
  }
}
