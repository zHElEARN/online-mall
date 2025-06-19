"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addToCart } from "../actions";
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
  const [isLoading, setIsLoading] = useState(false);

  const getFirstImage = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return imageArray[0];
      }
    } catch {
      if (images && typeof images === "string" && images.trim()) {
        return images;
      }
    }
    return null;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // 防止触发 Link 跳转
    setIsLoading(true);
    try {
      await addToCart(product.id, 1);
      toast.success("商品已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入购物车失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col p-0">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-square">
          {getFirstImage(product.images) ? (
            <Image
              src={getFirstImage(product.images)}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">暂无图片</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
        </Link>

        <div className="space-y-2 mt-auto">
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

          {product.category && (
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            店铺: {product.seller.username}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>加入中...</>
          ) : product.stock === 0 ? (
            "缺货"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              加入购物车
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SearchResults({ query }: { query: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await searchProducts(query);
        setProducts(data);
      } catch (error) {
        console.error("搜索商品失败:", error);
        toast.error("搜索商品失败");
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      loadProducts();
    }
  }, [query]);

  if (isLoading) {
    return <SearchSkeleton />;
  }

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(defaultValue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索您想要的商品..."
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchForm defaultValue={query} />
      </div>

      <SearchResults query={query} />
    </div>
  );
}
