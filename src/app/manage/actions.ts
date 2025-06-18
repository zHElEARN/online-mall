"use server";

import { JWT_SECRET } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { UserInfo } from "@/types/user";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

interface GetUserResult {
  success: boolean;
  user?: UserInfo;
  error?: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayOrders: number;
  totalStock: number;
  lowStockProducts: number;
}

export const getCurrentUser = async (): Promise<GetUserResult> => {
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("获取当前用户信息失败:", error);
    return { success: false, error: "获取用户信息失败" };
  }
};

export const getDashboardStats = async (): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> => {
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

    const userId = payload.sub as string;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      revenueResult,
      todayOrders,
      stockResult,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({
        where: { sellerId: userId },
      }),
      prisma.product.count({
        where: { sellerId: userId, isActive: true },
      }),
      prisma.order.count({
        where: { product: { sellerId: userId } },
      }),
      prisma.order.count({
        where: {
          product: { sellerId: userId },
          status: { in: ["PENDING", "PAID"] },
        },
      }),
      prisma.order.aggregate({
        where: {
          product: { sellerId: userId },
          status: { in: ["PAID", "SHIPPED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({
        where: {
          product: { sellerId: userId },
          createdAt: { gte: today },
        },
      }),
      prisma.product.aggregate({
        where: { sellerId: userId, isActive: true },
        _sum: { stock: true },
      }),
      prisma.product.count({
        where: { sellerId: userId, isActive: true, stock: { lt: 10 } },
      }),
    ]);

    const stats: DashboardStats = {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueResult._sum.totalPrice || 0,
      todayOrders,
      totalStock: stockResult._sum.stock || 0,
      lowStockProducts,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("获取仪表板统计数据失败:", error);
    return { success: false, error: "获取统计数据失败" };
  }
};

export const getRecentOrders = async (limit: number = 5) => {
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

    const userId = payload.sub as string;

    const orders = await prisma.order.findMany({
      where: { product: { sellerId: userId } },
      include: {
        product: { select: { name: true } },
        buyer: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, orders };
  } catch (error) {
    console.error("获取最近订单失败:", error);
    return { success: false, error: "获取最近订单失败" };
  }
};

export const logout = async (): Promise<{ success: boolean }> => {
  try {
    (await cookies()).delete("token");
    return { success: true };
  } catch (error) {
    console.error("登出失败:", error);
    return { success: false };
  }
};
