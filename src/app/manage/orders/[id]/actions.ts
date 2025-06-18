"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../actions";

interface OrderWithDetails {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note: string | null;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    realName: string | null;
    avatar: string | null;
  };
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string;
    category: string | null;
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

interface GetOrderResult {
  success: boolean;
  order?: OrderWithDetails;
  error?: string;
}

export const getOrder = async (orderId: string): Promise<GetOrderResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "SELLER") {
      return { success: false, error: "只有卖家可以查看订单详情" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
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
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            category: true,
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
    });

    if (!order) {
      return { success: false, error: "订单不存在或无权限查看" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return { success: false, error: "获取订单详情失败" };
  }
};
