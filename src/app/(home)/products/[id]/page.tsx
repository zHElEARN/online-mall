"use client";

import { BackButton } from "@/components/back-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addToCart,
  getAverageRating,
  getProductById,
  getProductReviews,
  getRelatedProducts,
} from "./actions";
import { ProductDetailSkeleton } from "./skeleton";

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
    id: string;
    username: string;
    realName: string | null;
    avatar: string | null;
  };
  _count: {
    reviews: number;
  };
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    username: string;
    avatar: string | null;
  };
};

type RelatedProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string;
  stock: number;
  salesCount: number;
  category: string | null;
  seller: {
    username: string;
  };
  _count: {
    reviews: number;
  };
};

function ProductImageGallery({
  images,
  productName,
}: {
  images: string;
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  const getImageArray = (images: string) => {
    try {
      const imageArray = JSON.parse(images);
      if (Array.isArray(imageArray)) {
        return imageArray;
      }
    } catch {
      if (images && typeof images === "string" && images.trim()) {
        return [images];
      }
    }
    return [];
  };

  const imageArray = getImageArray(images);

  if (imageArray.length === 0) {
    return (
      <div className="space-y-4">
        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p>暂无图片</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full aspect-square relative overflow-hidden rounded-lg border">
        <Image
          src={imageArray[selectedImage]}
          alt={productName}
          width={600}
          height={600}
          className="w-full h-full object-cover"
        />
      </div>

      {imageArray.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imageArray.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-colors ${
                selectedImage === index
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
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

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const [productData, reviewsData, averageRatingData] = await Promise.all(
          [
            getProductById(productId),
            getProductReviews(productId),
            getAverageRating(productId),
          ]
        );

        if (!productData) {
          toast.error("商品不存在或已下架");
          return;
        }

        setProduct(productData);
        setReviews(reviewsData);
        setAverageRating(averageRatingData);

        // 获取相关商品
        const relatedProductsData = await getRelatedProducts(
          productId,
          productData.category
        );
        setRelatedProducts(relatedProductsData);
      } catch (error) {
        console.error("加载商品数据失败:", error);
        toast.error("加载失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;

    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success("商品已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入购物车失败");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">商品不存在</h1>
          <p className="text-muted-foreground mb-6">该商品可能已被删除或下架</p>
          <BackButton href="/products">返回商品列表</BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={averageRating} size="lg" />
              <span className="text-muted-foreground">
                ({product._count.reviews} 条评论)
              </span>
              <span className="text-muted-foreground">
                已售 {product.salesCount}
              </span>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="border-t border-b py-6">
            <div className="text-4xl font-bold text-primary mb-2">
              ¥{product.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>库存: {product.stock} 件</span>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="text-sm font-medium mb-2 block">数量:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 h-10 border rounded-md flex items-center justify-center font-medium">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  (最多 {product.stock} 件)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full h-12"
                size="lg"
              >
                {isAddingToCart ? (
                  "加入中..."
                ) : product.stock === 0 ? (
                  "缺货"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    加入购物车
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 店铺信息 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.seller.avatar || undefined} />
                  <AvatarFallback>
                    <Store className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{product.seller.username}</div>
                  {product.seller.realName && (
                    <div className="text-sm text-muted-foreground">
                      {product.seller.realName}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 商品评论 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          商品评论 ({reviews.length})
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.avatar || undefined} />
                      <AvatarFallback>
                        {review.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            {review.user.username}
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>暂无评论</p>
          </div>
        )}
      </section>

      {/* 相关商品 */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">相关商品</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <RelatedProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
