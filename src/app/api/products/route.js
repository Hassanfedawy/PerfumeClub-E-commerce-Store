import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Import ObjectId if needed for MongoDB conversions
import { ObjectId } from 'mongodb';

//
// Helper functions
//

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

const buildWhereClause = (category, season, q) => {
  const where = {};
  if (category) where.category = category;
  if (season) where.season = season;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  return where;
};

//
// GET: Fetch products
//
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const { page, limit, category, season, q, sortBy, order } = parseQueryParams(searchParams);
    const skip = (page - 1) * limit;
    const where = buildWhereClause(category, season, q);

    // For non-admin users, only show products with stock > 0.
    if (session?.user?.role !== 'admin') {
      where.stock = { gt: 0 };
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
    });

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

//
// POST: Create a new product
//
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const requiredFields = ['name', 'description', 'price', 'category', 'season', 'stock'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    if (isNaN(data.price) || parseFloat(data.price) <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    if (isNaN(data.stock) || parseInt(data.stock) < 0) {
      return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

//
// PUT: Update a product
//
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (data.price && (isNaN(data.price) || parseFloat(data.price) <= 0)) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    if (data.stock && (isNaN(data.stock) || parseInt(data.stock) < 0)) {
      return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        stock: data.stock ? parseInt(data.stock) : undefined,
        id: undefined, // Remove id from data to avoid Prisma errors
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

//
// DELETE: Remove a product
//
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

  

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
