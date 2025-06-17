"use server";

import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { z } from "zod";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名长度不能小于3个字符")
      .max(20, "用户名长度不能超过20个字符")
      .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
    password: z
      .string()
      .min(6, "密码长度不能小于6个字符")
      .max(100, "密码长度不能超过100个字符"),
    confirmPassword: z.string(),
    role: z.enum(["BUYER", "SELLER"], {
      required_error: "请选择用户类型",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterResult = {
  success: boolean;
  error?: string;
};

export const register = async (formData: FormData): Promise<RegisterResult> => {
  try {
    const rawData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as "BUYER" | "SELLER",
    };

    const validationResult = registerSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      return { success: false, error: firstError || "输入数据无效" };
    }

    const { username, password, role } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: "用户名已存在" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
      },
    });
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      sub: user.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("注册失败:", error);
    return { success: false, error: "注册失败，请稍后再试" };
  }
};
