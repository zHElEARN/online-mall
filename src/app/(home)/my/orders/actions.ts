"use server";

import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const getCurrentUser = async () => {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return { success: false, error: "未登录或会话已过期" };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      return { success: false, error: "无效的令牌" };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub as string,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        realName: true,
      },
    });

    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return { success: false, error: "获取用户信息失败" };
  }
};

export const getBuyerOrders = async () => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "BUYER") {
      return { success: false, error: "只有买家可以查看订单" };
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: userResult.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            seller: {
              select: {
                id: true,
                username: true,
                realName: true,
              },
            },
            reviews: {
              where: {
                userId: userResult.user.id,
              },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
            },
          },
        },
        address: {
          select: {
            id: true,
            receiverName: true,
            phone: true,
            province: true,
            city: true,
            district: true,
            detail: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("获取订单失败:", error);
    return { success: false, error: "获取订单失败" };
  }
};

export const confirmOrder = async (orderId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "BUYER") {
      return { success: false, error: "只有买家可以确认收货" };
    }

    // 检查订单是否存在且属于当前用户
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userResult.user.id,
      },
    });

    if (!order) {
      return { success: false, error: "订单不存在" };
    }

    if (order.status !== "SHIPPED") {
      return { success: false, error: "只有已发货的订单可以确认收货" };
    }

    // 更新订单状态为已完成
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("确认收货失败:", error);
    return { success: false, error: "确认收货失败" };
  }
};

export const payOrder = async (orderId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "BUYER") {
      return { success: false, error: "只有买家可以支付订单" };
    }

    // 检查订单是否存在且属于当前用户
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userResult.user.id,
      },
    });

    if (!order) {
      return { success: false, error: "订单不存在" };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "只有待支付的订单可以支付" };
    }

    // 更新订单状态为已支付
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "PAID",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("支付失败:", error);
    return { success: false, error: "支付失败" };
  }
};

export const createReview = async (
  productId: string,
  rating: number,
  comment?: string
) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "BUYER") {
      return { success: false, error: "只有买家可以评价商品" };
    }

    // 检查用户是否已经评价过此商品
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: userResult.user.id,
          productId: productId,
        },
      },
    });

    if (existingReview) {
      return { success: false, error: "您已经评价过此商品" };
    }

    // 检查用户是否购买过此商品且订单已完成
    const completedOrder = await prisma.order.findFirst({
      where: {
        buyerId: userResult.user.id,
        productId: productId,
        status: "COMPLETED",
      },
    });

    if (!completedOrder) {
      return { success: false, error: "只能评价已完成的订单商品" };
    }

    // 创建评价
    await prisma.review.create({
      data: {
        userId: userResult.user.id,
        productId: productId,
        rating: rating,
        comment: comment || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("创建评价失败:", error);
    return { success: false, error: "创建评价失败" };
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "BUYER") {
      return { success: false, error: "只有买家可以取消订单" };
    }

    // 检查订单是否存在且属于当前用户
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userResult.user.id,
      },
    });

    if (!order) {
      return { success: false, error: "订单不存在" };
    }

    if (order.status !== "PENDING" && order.status !== "PAID") {
      return { success: false, error: "只有待支付和已支付的订单可以取消" };
    }

    // 更新订单状态为已取消
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "CANCELED",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("取消订单失败:", error);
    return { success: false, error: "取消订单失败" };
  }
};
