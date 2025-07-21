import { ExploreFeedClient } from "@/components/ExploreFeedClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 shadow-md bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-8 w-40 rounded" />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-2 rounded" />
          <Skeleton className="h-6 w-96 mx-auto rounded" />
        </div>
        <div
          className="masonry-grid"
          style={{ columnCount: 3, columnGap: "1rem" }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4">
              <Skeleton className="w-full h-64 rounded-lg" />
              <Skeleton className="w-3/4 h-4 mt-2 rounded" />
              <Skeleton className="w-1/2 h-4 mt-1 rounded" />
            </div>
          ))}
        </div>
      </main>
      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <Skeleton className="h-4 w-1/3 mx-auto rounded" />
      </footer>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExploreFeedClient />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
