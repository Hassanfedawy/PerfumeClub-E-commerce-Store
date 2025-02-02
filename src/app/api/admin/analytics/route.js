import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403 }
      );
    }

    // Get all statistics in parallel
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      revenue
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      })
    ]);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: revenue._sum.total || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
