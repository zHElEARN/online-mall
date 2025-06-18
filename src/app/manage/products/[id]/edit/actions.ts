"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../../actions";
import { z } from "zod";
import { cache } from "react";

const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "商品名称不能为空")
    .max(100, "商品名称不能超过100个字符"),
  description: z.string().optional(),
  price: z.number().min(0.01, "价格必须大于0"),
  stock: z.number().int().min(0, "库存不能为负数"),
  category: z.string().optional(),
  images: z.array(z.string()).min(1, "至少需要上传一张商品图片"),
  isActive: z.boolean().optional(),
});

interface UpdateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
  isActive?: boolean;
}

interface UpdateProductResult {
  success: boolean;
  product?: {
    id: string;
    name: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export const getProductForEdit = cache(async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        category: true,
        images: true,
        isActive: true,
        sellerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return null;
    }

    let images: string[] = [];
    try {
      images = JSON.parse(product.images);
    } catch {
      images = [];
    }

    return {
      ...product,
      images,
    };
  } catch (error) {
    console.error("获取商品信息失败:", error);
    return null;
  }
});

export const updateProduct = async (
  id: string,
  data: UpdateProductData
): Promise<UpdateProductResult> => {
  try {
    const validationResult = updateProductSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        error: "表单数据验证失败",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    if (userResult.user.role !== "SELLER") {
      return { success: false, error: "只有卖家才能编辑商品" };
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existingProduct) {
      return { success: false, error: "商品不存在" };
    }

    if (existingProduct.sellerId !== userResult.user.id) {
      return { success: false, error: "您只能编辑自己的商品" };
    }

    const { name, description, price, stock, category, images, isActive } =
      validationResult.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        stock,
        category: category || null,
        images: JSON.stringify(images),
        isActive: isActive ?? true,
      },
    });

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
      },
    };
  } catch (error) {
    console.error("更新商品失败:", error);
    return { success: false, error: "更新商品失败，请稍后重试" };
  }
};
