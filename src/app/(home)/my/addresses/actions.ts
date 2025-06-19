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

export const getUserAddresses = async () => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: userResult.user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, addresses };
  } catch (error) {
    console.error("获取地址失败:", error);
    return { success: false, error: "获取地址失败" };
  }
};

export const createAddress = async (data: {
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
}) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 如果设置为默认地址，需要先将其他地址设为非默认
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: userResult.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: userResult.user.id,
      },
    });

    return { success: true, address };
  } catch (error) {
    console.error("创建地址失败:", error);
    return { success: false, error: "创建地址失败" };
  }
};

export const updateAddress = async (
  addressId: string,
  data: {
    receiverName: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    isDefault?: boolean;
  }
) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 验证地址是否属于当前用户
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userResult.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "地址不存在或无权限修改" };
    }

    // 如果设置为默认地址，需要先将其他地址设为非默认
    if (data.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: userResult.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: {
        id: addressId,
      },
      data,
    });

    return { success: true, address };
  } catch (error) {
    console.error("更新地址失败:", error);
    return { success: false, error: "更新地址失败" };
  }
};

export const deleteAddress = async (addressId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 验证地址是否属于当前用户
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userResult.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "地址不存在或无权限删除" };
    }

    // 检查是否有关联的订单
    const ordersCount = await prisma.order.count({
      where: {
        addressId: addressId,
      },
    });

    if (ordersCount > 0) {
      return { success: false, error: "该地址已被订单使用，无法删除" };
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("删除地址失败:", error);
    return { success: false, error: "删除地址失败" };
  }
};

export const setDefaultAddress = async (addressId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 验证地址是否属于当前用户
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userResult.user.id,
      },
    });

    if (!existingAddress) {
      return { success: false, error: "地址不存在或无权限修改" };
    }

    // 将其他地址设为非默认
    await prisma.address.updateMany({
      where: {
        userId: userResult.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // 设置目标地址为默认
    await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("设置默认地址失败:", error);
    return { success: false, error: "设置默认地址失败" };
  }
};