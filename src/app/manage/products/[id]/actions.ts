"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getProduct = cache(async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
});

export const getProductOrders = cache(async (productId: string) => {
  try {
    const orders = await prisma.order.findMany({
      where: { productId },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Failed to fetch product orders:", error);
    return [];
  }
});

export const getProductStats = cache(async (productId: string) => {
  try {
    const [totalOrders, totalRevenue, averageRating] = await Promise.all([
      prisma.order.count({
        where: { productId },
      }),
      prisma.order.aggregate({
        where: { productId },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.review.aggregate({
        where: { productId },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      averageRating: averageRating._avg.rating || 0,
    };
  } catch (error) {
    console.error("Failed to fetch product stats:", error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
    };
  }
});
