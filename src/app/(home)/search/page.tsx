import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { searchProducts } from "./actions";
import { SearchSkeleton } from "./skeleton";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string;
  stock: number;
  isActive: boolean;
  category: string | null;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  seller: {
    username: string;
  };
  _count: {
    reviews: number;
  };
};

function ProductCard({ product }: { product: Product }) {
  const images = JSON.parse(product.images || "[]");
  const hasImage = images && images.length > 0;
  const mainImage = hasImage ? images[0] : null;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 p-0 h-[420px] flex flex-col">
      <div className="relative overflow-hidden">
        {hasImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">暂无图片</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ¥{product.price.toFixed(2)}
            </span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>({product._count.reviews})</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>售出 {product.salesCount}</span>
            <span>库存 {product.stock}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            店铺: {product.seller.username}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm">
          <ShoppingBag className="w-4 h-4 mr-2" />
          加入购物车
        </Button>
      </CardFooter>
    </Card>
  );
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-2">未找到相关商品</h3>
        <p className="text-muted-foreground">
          没有找到与 &ldquo;{query}&rdquo; 相关的商品，请尝试其他关键词
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          搜索结果 ({products.length} 件商品)
        </h2>
        <p className="text-muted-foreground">关键词: &ldquo;{query}&rdquo;</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/search" method="GET" className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          name="q"
          placeholder="搜索您想要的商品..."
          defaultValue={defaultValue}
          className="pl-10 pr-20 py-3 text-lg h-12 rounded-full border-2 focus:border-primary transition-colors"
          autoFocus={!defaultValue}
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6 h-8"
          size="sm"
        >
          搜索
        </Button>
      </div>
    </form>
  );
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim();

  if (!query) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <Search className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">搜索商品</h1>
            <p className="text-muted-foreground">输入关键词，发现心仪商品</p>
          </div>
          <SearchForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchForm defaultValue={query} />
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
