"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../actions";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserProfileSchema = z.object({
  realName: z
    .string()
    .max(50, "真实姓名不能超过50个字符")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("邮箱格式不正确")
    .max(100, "邮箱不能超过100个字符")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "手机号格式不正确")
    .optional()
    .or(z.literal("")),
  avatar: z
    .string()
    .max(500, "头像URL不能超过500个字符")
    .optional()
    .or(z.literal("")),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z
      .string()
      .min(6, "新密码至少需要6位")
      .max(100, "新密码不能超过100个字符"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmPassword"],
  });

interface UpdateUserProfileData {
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface UpdateUserProfileResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const updateUserProfile = async (
  data: UpdateUserProfileData
): Promise<UpdateUserProfileResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const validationResult = updateUserProfileSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      return { success: false, error: firstError || "输入数据无效" };
    }

    const validatedData = validationResult.data;

    if (validatedData.email && validatedData.email.trim() !== "") {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: userResult.user.id },
        },
      });

      if (existingUser) {
        return { success: false, error: "该邮箱已被其他用户使用" };
      }
    }

    if (validatedData.phone && validatedData.phone.trim() !== "") {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone,
          id: { not: userResult.user.id },
        },
      });

      if (existingUser) {
        return { success: false, error: "该手机号已被其他用户使用" };
      }
    }

    const updateData: {
      realName?: string;
      email?: string | null;
      phone?: string | null;
      avatar?: string | null;
    } = {};
    if (
      validatedData.realName !== undefined &&
      validatedData.realName.trim() !== ""
    ) {
      updateData.realName = validatedData.realName.trim();
    }
    if (validatedData.email !== undefined) {
      updateData.email =
        validatedData.email.trim() === "" ? null : validatedData.email.trim();
    }
    if (validatedData.phone !== undefined) {
      updateData.phone =
        validatedData.phone.trim() === "" ? null : validatedData.phone.trim();
    }
    if (validatedData.avatar !== undefined) {
      updateData.avatar =
        validatedData.avatar.trim() === "" ? null : validatedData.avatar.trim();
    }

    await prisma.user.update({
      where: { id: userResult.user.id },
      data: updateData,
    });

    revalidatePath("/manage/settings");
    return { success: true, message: "个人信息更新成功" };
  } catch (error) {
    console.error("更新用户信息失败:", error);
    return { success: false, error: "更新失败，请稍后重试" };
  }
};

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const changePassword = async (
  data: ChangePasswordData
): Promise<ChangePasswordResult> => {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: userResult.error || "用户未登录" };
    }

    const validationResult = changePasswordSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      return { success: false, error: firstError || "输入数据无效" };
    }

    const { currentPassword, newPassword } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id: userResult.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, error: "用户不存在" };
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: "当前密码错误" };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userResult.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: "密码修改成功" };
  } catch (error) {
    console.error("修改密码失败:", error);
    return { success: false, error: "修改密码失败，请稍后重试" };
  }
};
