"use server";

import { prisma } from "@/lib/prisma";

export async function searchProducts(query: string) {
  if (!query || query.trim() === "") {
    return [];
  }

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
    });

    return products;
  } catch (error) {
    console.error("搜索商品失败:", error);
    return [];
  }
}
