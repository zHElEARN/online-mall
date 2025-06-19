import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { ENDPOINT_URL, JWT_SECRET } from "@/lib/env";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // JWT 鉴权
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "未登录或会话已过期" },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (!payload.sub) {
        return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
      }

      // 验证用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
        select: { id: true, role: true },
      });

      if (!user) {
        return NextResponse.json({ error: "用户不存在" }, { status: 401 });
      }

      // 用户已登录，允许上传图片
    } catch (jwtError) {
      console.error("JWT验证失败:", jwtError);
      return NextResponse.json({ error: "令牌无效或已过期" }, { status: 401 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 JPEG、PNG、GIF、WebP 格式" },
        { status: 400 }
      );
    }

    // 检查文件大小 (5MB限制)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件大小超出限制，最大支持5MB" },
        { status: 400 }
      );
    }

    // 生成UUID作为文件名
    const uuid = randomUUID();
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${uuid}.${fileExtension}`;

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // 目录已存在，忽略错误
    }

    // 转换文件为Buffer并保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // 拼接完整的URL（使用动态路由）
    const fullUrl = `${ENDPOINT_URL}/api/images/${uuid}`;

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: "图片上传成功",
      data: {
        uuid,
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fullUrl, // 返回动态路由URL
        localPath: `/uploads/${fileName}`, // 本地路径（备用）
      },
    });
  } catch (error) {
    console.error("图片上传失败:", error);
    return NextResponse.json(
      { error: "图片上传失败，请稍后重试" },
      { status: 500 }
    );
  }
}
