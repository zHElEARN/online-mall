"use server";

import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return { success: false, message: "请先登录" };
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return { success: false, message: "商品不存在或已下架" };
    }

    if (product.stock < quantity) {
      return { success: false, message: "库存不足" };
    }

    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authStatus.user.id,
          productId,
        },
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return { success: false, message: "加入数量超过库存限制" };
      }

      await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await prisma.cart.create({
        data: {
          userId: authStatus.user.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true, message: "已加入购物车" };
  } catch (error) {
    console.error("加入购物车失败:", error);
    return { success: false, message: "加入购物车失败，请稍后重试" };
  }
}

export async function checkProductInCart(productId: string) {
  try {
    const authStatus = await getAuthStatus();

    if (!authStatus.isAuthenticated || !authStatus.user) {
      return false;
    }

    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: authStatus.user.id,
          productId,
        },
      },
    });

    return !!cartItem;
  } catch (error) {
    console.error("检查购物车状态失败:", error);
    return false;
  }
}
