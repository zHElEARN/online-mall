import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div>
      {/* 搜索结果标题骨架 */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* 搜索结果骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden h-[420px] flex flex-col">
            <Skeleton className="w-full h-48" />
            <CardContent className="p-4 flex-1">
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EmptySearchSkeleton() {
  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl mx-auto px-4">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
