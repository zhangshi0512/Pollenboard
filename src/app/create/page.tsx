import { fetchImageModels, fetchTextModelsAndVoices } from "@/lib/pollinations";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePageClient } from "@/components/CreatePageClient";

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-40 mb-6" />
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-4">
            <Skeleton className="w-full h-64 rounded-lg" />
            <Skeleton className="w-3/4 h-4 mt-2 rounded" />
            <Skeleton className="w-1/2 h-4 mt-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CreatePage() {
  const [imageModels, { textModelIds, voices }] = await Promise.all([
    fetchImageModels(),
    fetchTextModelsAndVoices(),
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreatePageClient
        initialImageModels={imageModels}
        initialTextModels={textModelIds}
        initialVoices={voices}
      />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
