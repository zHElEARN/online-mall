"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    href?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  manage: {
    label: "商家管理",
    href: "/manage",
  },
  products: {
    label: "商品管理",
    href: "/manage/products",
  },
  create: {
    label: "创建商品",
  },
  edit: {
    label: "编辑商品",
  },
  orders: {
    label: "订单管理",
    href: "/manage/orders",
  },
  settings: {
    label: "商家设置",
    href: "/manage/settings",
  },
};

interface BreadcrumbItemData {
  path: string;
  label: string;
  href?: string;
  isLast: boolean;
}

export function NavBreadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems: BreadcrumbItemData[] = [];

  pathSegments.forEach((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const config = breadcrumbConfig[segment];
    const isLast = index === pathSegments.length - 1;

    if (config) {
      breadcrumbItems.push({
        path,
        label: config.label,
        href: config.href || path,
        isLast,
      });
    } else {
      // 处理动态路由（如商品ID）
      if (
        index > 0 &&
        pathSegments[index - 1] === "products" &&
        pathSegments[0] === "manage"
      ) {
        // 这是一个商品ID
        breadcrumbItems.push({
          path,
          label: "商品详情",
          isLast,
        });
      }
    }
  });

  const breadcrumbElements = breadcrumbItems.map((item) => (
    <BreadcrumbItem key={item.path}>
      {item.isLast ? (
        <BreadcrumbPage>{item.label}</BreadcrumbPage>
      ) : (
        <BreadcrumbLink href={item.href || item.path}>
          {item.label}
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  ));

  const breadcrumbWithSeparators = breadcrumbElements.reduce<React.ReactNode[]>(
    (acc, item, index) => {
      if (index > 0) {
        acc.push(
          <BreadcrumbSeparator
            key={`separator-${index}`}
            className="hidden md:block"
          />
        );
      }
      acc.push(item);
      return acc;
    },
    []
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbWithSeparators}</BreadcrumbList>
    </Breadcrumb>
  );
}
