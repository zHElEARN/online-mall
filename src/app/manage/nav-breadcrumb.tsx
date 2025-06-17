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
  orders: {
    label: "订单管理",
    href: "/manage/orders",
  },
  settings: {
    label: "系统设置",
    href: "/manage/settings",
  },
};

export function NavBreadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSegments
    .map((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const config = breadcrumbConfig[segment];

      if (!config) {
        return null;
      }

      const isLast = index === pathSegments.length - 1;

      return (
        <BreadcrumbItem key={path}>
          {isLast ? (
            <BreadcrumbPage>{config.label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={config.href || path}>
              {config.label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      );
    })
    .filter(Boolean);

  const breadcrumbWithSeparators = breadcrumbItems.reduce<React.ReactNode[]>(
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
