"use server";

import { prisma } from "@/lib/prisma";
import { getAuthStatus } from "../../actions";
import { revalidatePath } from "next/cache";

export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            realName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return product;
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return null;
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  } catch (error) {
    console.error("获取商品评论失败:", error);
    return [];
  }
}

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      throw new Error("请先登录");
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new Error("商品不存在或已下架");
    }

    if (product.stock < quantity) {
      throw new Error("库存不足");
    }

    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authStatus.user.id,
          productId,
        },
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new Error("加入数量超过库存限制");
      }

      await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await prisma.cart.create({
        data: {
          userId: authStatus.user.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true, message: "已加入购物车" };
  } catch (error) {
    console.error("加入购物车失败:", error);
    throw error;
  }
}

export async function checkProductInCart(productId: string) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return false;
    }

    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authStatus.user.id,
          productId,
        },
      },
    });

    return !!cartItem;
  } catch (error) {
    console.error("检查购物车状态失败:", error);
    return false;
  }
}

export async function getRelatedProducts(productId: string, category?: string | null) {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          not: productId,
        },
        isActive: true,
        ...(category && { category }),
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
      orderBy: [
        { salesCount: "desc" },
        { createdAt: "desc" },
      ],
      take: 4,
    });

    return products;
  } catch (error) {
    console.error("获取相关商品失败:", error);
    return [];
  }
}

export async function getAverageRating(productId: string) {
  try {
    const result = await prisma.review.aggregate({
      where: {
        productId,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  } catch (error) {
    console.error("获取平均评分失败:", error);
    return 0;
  }
}