import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ShoppingBag className="size-4" />
              </div>
              <span className="text-lg font-bold text-foreground">
                网上商城平台
              </span>
            </Link>

            <nav className="flex items-center gap-8">
              <Link
                href="/"
                className="text-primary font-medium border-b-2 border-primary pb-1"
              >
                首页
              </Link>
              <Link
                href="/search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                搜索
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                我的
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
