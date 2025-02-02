import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// Get all products with search and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const season = searchParams.get('season');
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || Number.MAX_SAFE_INTEGER;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const featured = searchParams.get('featured') === 'true';

    const where = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        { price: { gte: minPrice, lte: maxPrice } },
        { stock: { gt: 0 } }, // Only show in-stock products
      ],
    };

    if (category) {
      where.AND.push({ category });
    }

    if (season) {
      where.AND.push({ season });
    }

    if (featured) {
      where.AND.push({ featured: true });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
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
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString(),
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

// POST new product (protected - admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'season', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(data.price) || data.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(data.stock) || data.stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Convert string numbers to actual numbers
    const productData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock)
    };

    // Validate category
    const validCategories = ['men', 'women', 'unisex'];
    if (!validCategories.includes(productData.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate season
    const validSeasons = ['summer', 'winter'];
    if (!validSeasons.includes(productData.season)) {
      return NextResponse.json(
        { error: 'Invalid season' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
        season: productData.season,
        imageUrl: productData.imageUrl,
        imagePublicId: productData.imagePublicId || null,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT update product (protected - admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields if present
    if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (updateData.stock !== undefined && (typeof updateData.stock !== 'number' || updateData.stock < 0)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (updateData.category && !['men', 'women', 'unisex'].includes(updateData.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate season if provided
    if (updateData.season && !['summer', 'winter'].includes(updateData.season)) {
      return NextResponse.json(
        { error: 'Invalid season' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product (protected - admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          where: {
            order: {
              status: {
                in: ['PENDING', 'PROCESSING', 'SHIPPED']
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has active orders
    if (product.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with active orders' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
