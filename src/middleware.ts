import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { JWT_SECRET } from "./lib/env";
import { jwtVerify } from "jose";

const key = new TextEncoder().encode(JWT_SECRET);

const getUserAuthStatus = async (
  request: NextRequest
): Promise<{ isAuthenticated: boolean; role: string | null }> => {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return { isAuthenticated: false, role: null };
    }

    const { payload } = await jwtVerify(token, key);
    const role = payload.role as string;

    const roleMapping: { [key: string]: string } = {
      BUYER: "buyer",
      SELLER: "seller",
    };

    return {
      isAuthenticated: true,
      role: roleMapping[role] || null,
    };
  } catch (error) {
    console.error("JWT验证失败:", error);
    return { isAuthenticated: false, role: null };
  }
};

function logMiddlewareAction(
  pathname: string,
  isAuthenticated: boolean,
  role: string | null,
  actionDescription: string
) {
  console.log(
    `[中间件] 路径: ${pathname}, 认证: ${isAuthenticated}, 角色: ${role}, 动作: ${actionDescription}`
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, role } = await getUserAuthStatus(request);
  let actionDescription = "";

  if (role === "seller" && !pathname.startsWith("/manage")) {
    actionDescription = `卖家用户从 ${pathname} 重定向到 /manage`;
    logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
    return NextResponse.redirect(new URL("/manage", request.url));
  }

  if (pathname.startsWith("/manage") && !isAuthenticated) {
    actionDescription = `拒绝访问 ${pathname} (用户未认证)。重定向到登录页。`;
    logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/auth") && isAuthenticated) {
    if (role === "seller") {
      actionDescription = `卖家已认证，从 ${pathname} 重定向到 /manage`;
      logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
      return NextResponse.redirect(new URL("/manage", request.url));
    } else {
      actionDescription = `买家已认证，从 ${pathname} 重定向到 /`;
      logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (
    pathname.startsWith("/auth") &&
    !isAuthenticated &&
    pathname !== "/auth/login"
  ) {
    actionDescription = `未认证用户从 ${pathname} 重定向到 /auth/login`;
    logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  actionDescription = `允许访问 ${pathname}`;
  logMiddlewareAction(pathname, isAuthenticated, role, actionDescription);
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: ["/", "/auth/:path*", "/manage/:path*"],
};
