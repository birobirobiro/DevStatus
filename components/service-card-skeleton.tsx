import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="h-[380px] overflow-hidden bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Skeleton className="w-14 h-14 rounded-xl bg-zinc-800" />
            <Skeleton className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-800" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <Skeleton className="h-6 w-3/4 mb-2 bg-zinc-800" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-20 rounded-sm bg-zinc-800" />
            </div>
          </div>
          {/* Favorite button skeleton */}
          <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Status badge skeleton */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/30">
          <Skeleton className="w-4 h-4 rounded bg-zinc-700" />
          <Skeleton className="h-4 w-2/3 bg-zinc-700" />
        </div>

        {/* User reports section skeleton */}
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3 w-24 bg-zinc-700" />
            <Skeleton className="h-3 w-8 bg-zinc-700" />
          </div>
          
          {/* Sparkline skeleton */}
          <div className="flex items-end h-12 gap-0.5 mb-2">
            {[40, 65, 55, 75, 45, 60, 50, 70, 35, 55, 45, 60].map((height, i) => (
              <Skeleton
                key={i}
                className="flex-1 bg-zinc-700"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          
          <Skeleton className="h-3 w-16 bg-zinc-700" />
        </div>

        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-9 w-full rounded-lg bg-zinc-800" />
          <Skeleton className="h-9 w-full rounded-lg bg-zinc-800" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 bg-zinc-700" />
            <Skeleton className="h-3 w-12 bg-zinc-700" />
          </div>
          <Skeleton className="h-3 w-20 bg-zinc-700 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
}