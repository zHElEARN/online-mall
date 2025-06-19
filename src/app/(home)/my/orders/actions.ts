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
