"use server";

import { prisma } from "@/lib/prisma";
import { getAuthStatus } from "../actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPendingOrders() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return [];
    }

    const pendingOrders = await prisma.order.findMany({
      where: {
        buyerId: authStatus.user.id,
        status: "PENDING",
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
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pendingOrders;
  } catch (error) {
    console.error("获取待支付订单失败:", error);
    return [];
  }
}

export async function getUserAddresses() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return [];
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: authStatus.user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return addresses;
  } catch (error) {
    console.error("获取用户地址失败:", error);
    return [];
  }
}

export async function payPendingOrders(
  addressId: string,
  paymentMethod: "wechat" | "alipay"
) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      throw new Error("未登录");
    }

    // 验证地址是否属于当前用户
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: authStatus.user.id,
      },
    });

    if (!address) {
      throw new Error("地址不存在或无权访问");
    }

    // 获取待支付订单
    const pendingOrders = await prisma.order.findMany({
      where: {
        buyerId: authStatus.user.id,
        status: "PENDING",
      },
      include: {
        product: true,
      },
    });

    if (pendingOrders.length === 0) {
      throw new Error("没有待支付订单");
    }

    // 检查库存
    for (const order of pendingOrders) {
      if (order.product.stock < order.quantity) {
        throw new Error(`商品 ${order.product.name} 库存不足`);
      }
    }

    // 更新订单状态和库存
    await prisma.$transaction(async (tx) => {
      // 更新订单状态为已支付，并更新地址和支付备注
      await Promise.all(
        pendingOrders.map((order) =>
          tx.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              addressId: addressId,
              note: `使用${paymentMethod === "wechat" ? "微信" : "支付宝"}支付`,
            },
          })
        )
      );

      // 更新商品库存和销量
      await Promise.all(
        pendingOrders.map((order) =>
          tx.product.update({
            where: { id: order.productId },
            data: {
              stock: { decrement: order.quantity },
              salesCount: { increment: order.quantity },
            },
          })
        )
      );
    });

    revalidatePath("/confirm");
    revalidatePath("/my/orders");

    return { success: true, message: "支付成功" };
  } catch (error) {
    console.error("支付失败:", error);
    throw error;
  }
}

export async function calculateTotalPrice() {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return 0;
    }

    const pendingOrders = await prisma.order.findMany({
      where: {
        buyerId: authStatus.user.id,
        status: "PENDING",
      },
    });

    const total = pendingOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    return total;
  } catch (error) {
    console.error("计算总价失败:", error);
    return 0;
  }
}
