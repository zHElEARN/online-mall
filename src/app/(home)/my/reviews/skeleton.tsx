import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded flex-shrink-0" />

              <div className="flex-1">
                <Skeleton className="h-5 w-2/3 mb-2" />

                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Skeleton key={starIndex} className="h-4 w-4" />
                  ))}
                  <Skeleton className="h-4 w-8 ml-2" />
                </div>

                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />

                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
