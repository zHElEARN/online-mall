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

export const logout = async (): Promise<{ success: boolean }> => {
  try {
    (await cookies()).delete("token");
    return { success: true };
  } catch (error) {
    console.error("登出失败:", error);
    return { success: false };
  }
};
