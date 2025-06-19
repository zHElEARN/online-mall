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

export async function createPendingOrdersFromCart() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return { success: false, error: "未登录" };
    }

    // 获取购物车商品
    const cartItems = await prisma.cart.findMany({
      where: {
        userId: authStatus.user.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return { success: false, error: "购物车为空" };
    }

    // 检查库存
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return { success: false, error: `商品 ${item.product.name} 库存不足` };
      }
    }

    // 获取用户的默认地址，如果没有默认地址就用第一个地址
    const defaultAddress = await prisma.address.findFirst({
      where: {
        userId: authStatus.user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    if (!defaultAddress) {
      return { success: false, error: "请先添加收货地址", needAddress: true };
    }

    // 创建待支付订单并清空购物车
    await prisma.$transaction(async (tx) => {
      // 创建待支付订单
      await Promise.all(
        cartItems.map((item) =>
          tx.order.create({
            data: {
              buyerId: authStatus.user!.id,
              productId: item.productId,
              addressId: defaultAddress.id,
              quantity: item.quantity,
              totalPrice: item.product.price * item.quantity,
              status: "PENDING", // 待支付状态
            },
          })
        )
      );

      // 清空购物车
      await tx.cart.deleteMany({
        where: {
          userId: authStatus.user!.id,
        },
      });
    });

    revalidatePath("/cart");
    revalidatePath("/confirm");

    return { success: true };
  } catch (error) {
    console.error("创建待支付订单失败:", error);
    return { success: false, error: "创建订单失败，请稍后重试" };
  }
}
