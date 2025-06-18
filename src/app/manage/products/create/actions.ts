"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../actions";
import { z } from "zod";

// 创建商品表单验证 Schema
const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "商品名称不能为空")
    .max(100, "商品名称不能超过100个字符"),
  description: z.string().optional(),
  price: z.number().min(0.01, "价格必须大于0"),
  stock: z.number().int().min(0, "库存不能为负数"),
  category: z.string().optional(),
  images: z.array(z.string()).min(1, "至少需要上传一张商品图片"),
});

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
}

interface CreateProductResult {
  success: boolean;
  product?: {
    id: string;
    name: string;
  };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export const createProduct = async (
  data: CreateProductData
): Promise<CreateProductResult> => {
  try {
    const validationResult = createProductSchema.safeParse(data);

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
      return { success: false, error: "只有卖家才能创建商品" };
    }

    const { name, description, price, stock, category, images } =
      validationResult.data;

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        stock,
        category: category || null,
        images: JSON.stringify(images),
        sellerId: userResult.user.id,
        isActive: true,
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
    console.error("创建商品失败:", error);
    return { success: false, error: "创建商品失败，请稍后重试" };
  }
};
