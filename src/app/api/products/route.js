import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to parse query parameters
const parseQueryParams = (searchParams) => {
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 12;
  const category = searchParams.get('category');
  const season = searchParams.get('season');
  const q = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  return { page, limit, category, season, q, sortBy, order };
};

// Helper function to build where clause
const buildWhereClause = (category, season, q) => {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (season) {
    where.season = season;
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  return where;
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const { page, limit, category, season, q, sortBy, order } = parseQueryParams(searchParams);
    const skip = (page - 1) * limit;

    const where = buildWhereClause(category, season, q);

    if (!session?.user?.role === 'admin') {
      where.stock = { gt: 0 };
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Fetch products with pagination and sorting
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

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

    // Get categories and seasons for filters
    const [categories, seasons] = await Promise.all([
      prisma.product.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.product.groupBy({
        by: ['season'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      products: productsWithRating,
      filters: {
        categories: categories.map(c => ({ name: c.category, count: c._count })),
        seasons: seasons.map(s => ({ name: s.season, count: s._count })),
      },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'season', 'stock'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(data.price) || parseFloat(data.price) <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(data.stock) || parseInt(data.stock) < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields if present
    if (data.price && (isNaN(data.price) || parseFloat(data.price) <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (data.stock && (isNaN(data.stock) || parseInt(data.stock) < 0)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        stock: data.stock ? parseInt(data.stock) : undefined,
        id: undefined, // Remove id from data to avoid prisma error
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
