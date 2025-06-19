import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "在线商城",
    template: "%s | 在线商城",
  },
  description: "一个现代化的在线购物商城，提供优质商品和便捷的购物体验",
  keywords: ["购物", "商城", "在线购物", "电商"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          {children}
          <Toaster richColors={true} expand={true} />
        </ThemeProvider>
      </body>
    </html>
  );
}
