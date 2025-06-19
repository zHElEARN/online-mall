import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-full flex flex-col">
          <Skeleton className="w-full aspect-square" />
          <CardContent className="p-4 flex-1 flex flex-col">
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 mb-3" />
            <div className="space-y-2 mt-auto">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
