import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    let startDate = new Date();
    switch (timeRange) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '12m':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      default: // 7d
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get total revenue and orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'customer',
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get revenue by day
    const revenueByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        total: true,
      },
    });

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      _count: true,
      _sum: {
        quantity: true,
      },
    });

    const topProductDetails = await Promise.all(
      topProducts
        .sort((a, b) => b._sum.quantity - a._sum.quantity)
        .slice(0, 5)
        .map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          return {
            ...product,
            totalSales: item._sum.quantity,
            revenue: item._sum.quantity * product.price,
          };
        })
    );

    // Get sales by category
    const salesByCategory = await prisma.orderItem.groupBy({
      by: ['product.category'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Get recent activities
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        role: 'customer',
      },
    });

    // Combine and sort recent activities
    const recentActivities = [
      ...recentOrders.map(order => ({
        type: 'order',
        id: order.id,
        message: `New order #${order.id} from ${order.user.name}`,
        time: order.createdAt,
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        id: user.id,
        message: `New user registration: ${user.email}`,
        time: user.createdAt,
      })),
    ].sort((a, b) => b.time - a.time).slice(0, 5);

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        avgOrderValue,
      },
      revenueByDay,
      topProducts: topProductDetails,
      salesByCategory,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
