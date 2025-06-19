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

export const getUserReviews = async () => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const reviews = await prisma.review.findMany({
      where: {
        userId: userResult.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error("获取评论失败:", error);
    return { success: false, error: "获取评论失败" };
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 检查评论是否存在且属于当前用户
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: userResult.user.id,
      },
    });

    if (!review) {
      return { success: false, error: "评论不存在或无权限删除" };
    }

    // 删除评论
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return { success: true, message: "评论删除成功" };
  } catch (error) {
    console.error("删除评论失败:", error);
    return { success: false, error: "删除评论失败" };
  }
};

export const updateReview = async (
  reviewId: string,
  rating: number,
  comment: string
) => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    // 检查评论是否存在且属于当前用户
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: userResult.user.id,
      },
    });

    if (!existingReview) {
      return { success: false, error: "评论不存在或无权限编辑" };
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return { success: false, error: "评分必须在1-5之间" };
    }

    // 更新评论
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment: comment.trim() || null,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return { success: true, review: updatedReview, message: "评论更新成功" };
  } catch (error) {
    console.error("更新评论失败:", error);
    return { success: false, error: "更新评论失败" };
  }
};
