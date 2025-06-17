"use server";

import { prisma } from "@/lib/prisma";
import { JWT_SECRET } from "@/lib/env";
import { z } from "zod";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "用户名长度不能小于3个字符")
    .max(20, "用户名长度不能超过20个字符"),
  password: z
    .string()
    .min(6, "密码长度不能小于6个字符")
    .max(100, "密码长度不能超过100个字符"),
});

type LoginResult = {
  success: boolean;
  error?: string;
};

export const login = async (formData: FormData): Promise<LoginResult> => {
  try {
    const rawData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    const validationResult = loginSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      return { success: false, error: firstError || "输入数据无效" };
    }

    const { username, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { success: false, error: "用户名或密码错误" };
    }

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
    console.error("登录失败:", error);
    return { success: false, error: "登录失败，请稍后再试" };
  }
};
