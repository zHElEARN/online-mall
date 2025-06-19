"use server";

import { prisma } from "@/lib/prisma";
import { getAuthStatus } from "../actions";
import { revalidatePath } from "next/cache";

export async function getCartItems() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return [];
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: authStatus.user.id,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cartItems;
  } catch (error) {
    console.error("获取购物车失败:", error);
    return [];
  }
}

export async function updateCartItemQuantity(cartId: string, quantity: number) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      throw new Error("未登录");
    }

    if (quantity <= 0) {
      throw new Error("数量必须大于0");
    }

    await prisma.cart.update({
      where: {
        id: cartId,
        userId: authStatus.user.id,
      },
      data: {
        quantity,
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("更新购物车数量失败:", error);
    throw error;
  }
}

export async function removeCartItem(cartId: string) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      throw new Error("未登录");
    }

    await prisma.cart.delete({
      where: {
        id: cartId,
        userId: authStatus.user.id,
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("删除购物车商品失败:", error);
    throw error;
  }
}

export async function clearCart() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      throw new Error("未登录");
    }

    await prisma.cart.deleteMany({
      where: {
        userId: authStatus.user.id,
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("清空购物车失败:", error);
    throw error;
  }
}
