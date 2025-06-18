"use server";

import { prisma } from "@/lib/prisma";

export async function getRecommendedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        seller: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 12,
    });

    return products;
  } catch (error) {
    console.error("获取推荐商品失败:", error);
    return [];
  }
}

export async function searchProducts(query: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
          {
            category: {
              contains: query,
            },
          },
        ],
      },
      include: {
        seller: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return products;
  } catch (error) {
    console.error("搜索商品失败:", error);
    return [];
  }
}
