"use server";

import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type UserInfo = {
  id: string;
  role: string;
};

type AuthStatus = {
  isAuthenticated: boolean;
  user?: UserInfo;
};

export const getAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      isAuthenticated: true,
      user: {
        id: payload.sub as string,
        role: payload.role as string,
      },
    };
  } catch (error) {
    console.error("获取认证状态失败:", error);
    return { isAuthenticated: false };
  }
};

export const logout = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();

    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    console.log("用户已退出登录");
  } catch (error) {
    console.error("退出登录失败:", error);
  }

  redirect("/auth/login");
};

export async function getRecommendedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        seller: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 12,
    });

    return products;
  } catch (error) {
    console.error("获取推荐商品失败:", error);
    return [];
  }
}

export async function searchProducts(query: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
          {
            category: {
              contains: query,
            },
          },
        ],
      },
      include: {
        seller: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return products;
  } catch (error) {
    console.error("搜索商品失败:", error);
    return [];
  }
}
