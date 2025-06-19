import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    if (!uuid) {
      return NextResponse.json({ error: "缺少UUID参数" }, { status: 400 });
    }

    // 查找匹配UUID的文件
    const uploadDir = join(process.cwd(), "public", "uploads");
    const supportedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    let filePath: string | null = null;
    let fileExtension: string | null = null;

    // 遍历支持的文件扩展名，找到匹配的文件
    for (const ext of supportedExtensions) {
      const testPath = join(uploadDir, `${uuid}.${ext}`);
      if (existsSync(testPath)) {
        filePath = testPath;
        fileExtension = ext;
        break;
      }
    }

    if (!filePath || !fileExtension) {
      return NextResponse.json({ error: "图片不存在" }, { status: 404 });
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);

    // 根据文件扩展名设置正确的MIME类型
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };

    const mimeType = mimeTypes[fileExtension] || "image/jpeg";

    // 返回图片文件
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400", // 缓存1天
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("获取图片失败:", error);
    return NextResponse.json(
      { error: "获取图片失败，请稍后重试" },
      { status: 500 }
    );
  }
}
