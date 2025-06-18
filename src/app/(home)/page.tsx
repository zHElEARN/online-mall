import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { getRecommendedProducts } from "./actions";
import { ProductRecommendationsSkeleton } from "./skeleton";

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
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 p-0">
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
              <p className="text-sm">{product.name}</p>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 pb-0">
        <h3
          className="font-semibold text-lg mb-2 overflow-hidden text-ellipsis"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p
            className="text-muted-foreground text-sm mb-2 overflow-hidden text-ellipsis"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </p>
        )}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-muted-foreground">
            {product._count.reviews > 0 ? "4.5" : "暂无评分"}
          </span>
          <span className="text-sm text-muted-foreground/60">
            ({product._count.reviews} 评价)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-destructive">
              ¥{product.price.toFixed(2)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            已售 {product.salesCount}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">立即购买</Button>
      </CardFooter>
    </Card>
  );
}

async function ProductRecommendations() {
  const products = await getRecommendedProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">暂无商品推荐</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-primary text-primary-foreground flex aspect-square size-16 items-center justify-center rounded-xl">
            <ShoppingBag className="size-8" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground">网上商城平台</h1>
            <p className="text-muted-foreground text-lg">优质购物体验</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          发现优质商品，享受购物乐趣
        </p>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="搜索您想要的商品..."
              className="pl-10 pr-4 py-3 text-lg h-12 rounded-full border-2 focus:border-primary transition-colors"
            />
            <Button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6 h-8"
              size="sm"
            >
              搜索
            </Button>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">商品推荐</h2>
          <Button variant="outline">查看更多</Button>
        </div>

        <Suspense fallback={<ProductRecommendationsSkeleton />}>
          <ProductRecommendations />
        </Suspense>
      </section>
    </main>
  );
}
