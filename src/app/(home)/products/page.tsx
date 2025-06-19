"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addToCart, checkProductInCart, getAllProducts } from "./actions";
import { ProductsSkeleton } from "./skeleton";

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
  const [isInCart, setIsInCart] = useState(false);
  const [isCheckingCart, setIsCheckingCart] = useState(true);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const inCart = await checkProductInCart(product.id);
        setIsInCart(inCart);
      } catch (error) {
        console.error("检查购物车状态失败:", error);
      } finally {
        setIsCheckingCart(false);
      }
    };

    checkCart();
  }, [product.id]);

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

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        setIsInCart(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("加入购物车失败，请稍后重试");
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
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

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
          disabled={
            isLoading || product.stock === 0 || isInCart || isCheckingCart
          }
          className="w-full"
          size="sm"
          variant={isInCart ? "secondary" : "default"}
        >
          {isCheckingCart ? (
            <>检查中...</>
          ) : isLoading ? (
            <>加入中...</>
          ) : product.stock === 0 ? (
            "缺货"
          ) : isInCart ? (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              已加入购物车
            </>
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "商品列表 | 在线商城";
    
    const loadProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("加载商品失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-primary text-primary-foreground flex aspect-square size-16 items-center justify-center rounded-xl">
            <ShoppingBag className="size-8" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground">所有商品</h1>
            <p className="text-muted-foreground text-lg">发现更多优质商品</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          浏览我们的全部商品库存，找到您需要的商品
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            全部商品
            {!isLoading && products.length > 0 && `(共 ${products.length} 件)`}
          </h2>
        </div>

        {isLoading ? (
          <ProductsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">暂无商品</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
