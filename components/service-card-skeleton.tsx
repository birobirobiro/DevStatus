import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="h-auto sm:h-[380px] overflow-hidden bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="relative shrink-0">
            <Skeleton className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-800" />
            <Skeleton className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-zinc-800" />
          </div>
          <div className="flex-1 min-w-0 pr-6 sm:pr-8">
            <Skeleton className="h-5 sm:h-6 w-3/4 mb-1 sm:mb-2 bg-zinc-800" />
            <div className="flex gap-1">
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 rounded-sm bg-zinc-800" />
            </div>
          </div>
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2 sm:space-y-3 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-zinc-800 bg-zinc-800/30">
          <Skeleton className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-zinc-700" />
          <Skeleton className="h-3.5 sm:h-4 w-2/3 bg-zinc-700" />
        </div>

        <div className="bg-zinc-800/30 rounded-lg p-2 sm:p-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24 bg-zinc-700" />
            <Skeleton className="h-2.5 sm:h-3 w-6 sm:w-8 bg-zinc-700" />
          </div>
          
          <div className="flex items-end h-8 sm:h-12 gap-0.5 mb-1.5 sm:mb-2">
            {[40, 65, 55, 75, 45, 60, 50, 70, 35, 55, 45, 60].map((height, i) => (
              <Skeleton
                key={i}
                className="flex-1 bg-zinc-700"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          
          <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16 bg-zinc-700" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-2">
          <Skeleton className="h-8 sm:h-9 w-full rounded-lg bg-zinc-800" />
          <Skeleton className="h-8 sm:h-9 w-full rounded-lg bg-zinc-800" />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-1 sm:gap-2">
            <Skeleton className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-zinc-700" />
            <Skeleton className="h-2.5 sm:h-3 w-10 sm:w-12 bg-zinc-700" />
          </div>
          <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 bg-zinc-700 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
}