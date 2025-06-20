import { PollenBoardClient } from '@/components/PollenBoardClient';
import { fetchImageModels, fetchTextModelsAndVoices } from '@/lib/pollinations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 shadow-md bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-8 w-40 rounded" />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-12 w-48 rounded-md" />
        </div>
        <div 
          className="masonry-grid"
          style={{ columnCount: 3, columnGap: '1rem' }} // Approximate for loading
        >
          {Array.from({ length: 9 }).map((_, i) => (
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


export default async function HomePage() {
  // Fetching data on the server
  const imageModelsPromise = fetchImageModels();
  const textModelsAndVoicesPromise = fetchTextModelsAndVoices();

  const [imageModels, { textModelIds, voices }] = await Promise.all([
    imageModelsPromise,
    textModelsAndVoicesPromise,
  ]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PollenBoardClient
        initialImageModels={imageModels}
        initialTextModels={textModelIds}
        initialVoices={voices}
      />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request for models
