"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../actions";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string;
  stock: number;
  isActive: boolean;
  category: string | null;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GetUserProductsResult {
  success: boolean;
  products?: Product[];
  error?: string;
}

export const getUserProducts = async (): Promise<GetUserProductsResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const products = await prisma.product.findMany({
      where: {
        sellerId: userResult.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error("获取用户商品失败:", error);
    return { success: false, error: "获取商品列表失败" };
  }
};

export const deleteProduct = async (
  productId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: userResult.user.id,
      },
    });

    if (!product) {
      return { success: false, error: "商品不存在或无权限删除" };
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("删除商品失败:", error);
    return { success: false, error: "删除商品失败" };
  }
};
