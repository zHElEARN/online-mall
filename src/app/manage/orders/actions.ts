"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../actions";
import type { OrderStatus } from "@prisma/client";

interface OrderWithDetails {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    realName: string | null;
  };
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
  };
  address: {
    id: string;
    receiverName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
}

interface GetSellerOrdersResult {
  success: boolean;
  orders?: OrderWithDetails[];
  error?: string;
}

export const getSellerOrders = async (): Promise<GetSellerOrdersResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "SELLER") {
      return { success: false, error: "只有卖家可以查看订单" };
    }

    const orders = await prisma.order.findMany({
      where: {
        product: {
          sellerId: userResult.user.id,
        },
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            realName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
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
    return { success: false, error: "获取订单列表失败" };
  }
};

interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
}

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<UpdateOrderStatusResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "SELLER") {
      return { success: false, error: "只有卖家可以更新订单状态" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        product: {
          sellerId: userResult.user.id,
        },
      },
    });

    if (!order) {
      return { success: false, error: "订单不存在或无权限" };
    }

    // 商家不能将订单状态更新为已完成
    if (status === "COMPLETED") {
      return { success: false, error: "商家不能手动完成订单" };
    }

    if (status === "SHIPPED" && !trackingNumber) {
      return { success: false, error: "发货时必须提供快递单号" };
    }

    const updateData: { status: OrderStatus; trackingNumber?: string } = {
      status: status,
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("更新订单状态失败:", error);
    return { success: false, error: "更新订单状态失败" };
  }
};

export const cancelOrder = async (
  orderId: string
): Promise<UpdateOrderStatusResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "SELLER") {
      return { success: false, error: "只有卖家可以取消订单" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        product: {
          sellerId: userResult.user.id,
        },
      },
    });

    if (!order) {
      return { success: false, error: "订单不存在或无权限" };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "只有待支付状态的订单可以被取消" };
    }

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
