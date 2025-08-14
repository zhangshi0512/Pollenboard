"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Globe, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ExplorePinCard } from "@/components/ExplorePinCard";
import { ImageDetailModal } from "@/components/ImageDetailModal";
import type { PinData } from "@/types";
import type { PollinationsFeedItem } from "@/app/api/pollinations-feed/route";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function ExploreFeedClient() {
  const [feedItems, setFeedItems] = useState<PollinationsFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPinForDetail, setSelectedPinForDetail] =
    useState<PinData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pins, setPins] = useState<PinData[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const seenKeysRef = useRef<Set<string>>(new Set());
  const sseEnabled =
    typeof window !== "undefined" &&
    (process.env.NEXT_PUBLIC_USE_SSE_FEED ?? "true") !== "false";
  const { toast } = useToast();

  // Reference to the observer's target element (last item)
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchFeed = async (page = 1, refresh = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(
        `/api/pollinations-feed?page=${page}&limit=10&refresh=${refresh}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feed");
      }

      const data = await response.json();

      if (refresh || page === 1) {
        setFeedItems(data.items || []);
      } else {
        // Append new items to existing ones
        setFeedItems((prevItems) => [...prevItems, ...(data.items || [])]);
      }

      setLastUpdated(data.timestamp);
      setCurrentPage(data.page || page);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description: "Failed to load the explore feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const stopSSE = () => {
    try {
      eventSourceRef.current?.close();
    } catch {}
    eventSourceRef.current = null;
  };

  const startSSE = () => {
    stopSSE();
    setIsLoading(true);
    setFeedItems([]);
    setHasMore(true);
    setCurrentPage(1);
    seenKeysRef.current.clear();

    const es = new EventSource("https://image.pollinations.ai/feed");
    eventSourceRef.current = es;

    let gotFirstItem = false;
    const firstItemTimeout = setTimeout(() => {
      if (!gotFirstItem) {
        // Fallback to our API (which will return mock) to avoid blank UI
        stopSSE();
        fetchFeed(1, true);
      }
    }, 3000);

    es.onmessage = (event: MessageEvent) => {
      try {
        const item = JSON.parse(event.data) as PollinationsFeedItem;
        if (
          !item ||
          !item.imageURL ||
          !item.prompt ||
          item.nsfw ||
          item.isChild ||
          item.isMature
        ) {
          return;
        }
        gotFirstItem = true;
        clearTimeout(firstItemTimeout);
        const key = item.imageURL || String(item.seed);
        if (seenKeysRef.current.has(key)) return;
        seenKeysRef.current.add(key);
        setFeedItems((prev) => [item, ...prev].slice(0, 200));
        setIsLoading(false);
        setLastUpdated(new Date().toISOString());
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      clearTimeout(firstItemTimeout);
      stopSSE();
      // Fallback fetch to avoid leaving the UI empty
      fetchFeed(1, true);
    };
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (sseEnabled) {
      startSSE();
    } else {
      setCurrentPage(1);
      fetchFeed(1, true);
    }
  };

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
        fetchFeed(currentPage + 1);
      }
    },
    [hasMore, isLoading, isLoadingMore, currentPage]
  );

  // Set up the intersection observer
  useEffect(() => {
    if (sseEnabled) return; // no infinite scroll in SSE mode
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px 300px 0px", // Start loading when 300px from bottom
      threshold: 0.1,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver, sseEnabled]);

  // Initial load
  useEffect(() => {
    if (sseEnabled) {
      startSSE();
      return () => stopSSE();
    } else {
      fetchFeed();
    }
  }, [sseEnabled]);

  const handleImageClick = (feedItem: PollinationsFeedItem) => {
    // Convert PollinationsFeedItem to PinData format for the modal
    const pinData: PinData = {
      id: `explore-${feedItem.seed}-${Date.now()}`,
      imageUrl: feedItem.imageURL,
      originalPrompt: feedItem.prompt,
      finalPrompt: feedItem.prompt,
      modelUsed: feedItem.model,
      seed: feedItem.seed.toString(), // Convert number to string
      width: feedItem.width,
      height: feedItem.height,
      quality: feedItem.quality,
      negativePrompt: feedItem.negative_prompt,
      createdAt: new Date().toISOString(),
    };

    setSelectedPinForDetail(pinData);
    setPins([pinData]); // Add to pins array for the modal
    setIsDetailModalOpen(true);
  };

  // Handle adding audio to a pin
  const handleAddAudio = (updatedPin: PinData) => {
    // Update the selected pin with audio information
    setSelectedPinForDetail(updatedPin);

    // Update the pins array with the updated pin
    setPins([updatedPin]);

    toast({
      title: "Audio added",
      description: "Audio has been successfully added to this image",
    });
  };

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleImageLoad = (feedItem: PollinationsFeedItem) => {
    // Track successful loads if needed
    console.log(`Image loaded successfully: ${feedItem.seed}`);
  };

  const handleImageError = (feedItem: PollinationsFeedItem) => {
    console.warn(`Image failed to load: ${feedItem.seed}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Explore</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Discover amazing AI-generated images from the Pollinations community
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Feed
            </Button>
            {lastUpdated && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <Skeleton className="w-full h-64 rounded-lg" />
                <Skeleton className="w-3/4 h-4 mt-2 rounded" />
                <Skeleton className="w-1/2 h-4 mt-1 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && feedItems.length === 0 && (
          <div className="text-center py-12">
            <Globe size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline text-foreground mb-2">
              No Feed Items Available
            </h2>
            <p className="text-muted-foreground mb-6">
              Unable to load the community feed at the moment.
            </p>
            <Button
              onClick={() => fetchFeed(1, true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && feedItems.length > 0 && (
          <div
            className="masonry-grid"
            style={{
              columnCount: 1,
              columnGap: "1rem",
            }}
            ref={(el) => {
              if (el) {
                const width = window.innerWidth;
                if (width >= 1280) el.style.columnCount = "5";
                else if (width >= 1024) el.style.columnCount = "4";
                else if (width >= 768) el.style.columnCount = "3";
                else if (width >= 640) el.style.columnCount = "2";
                else el.style.columnCount = "1";
              }
            }}
          >
            {feedItems.map((item, index) => (
              <ExplorePinCard
                key={`${item.seed}-${index}`}
                feedItem={item}
                onImageClick={handleImageClick}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
              />
            ))}

            {/* Intersection Observer Target */}
            {!sseEnabled && (
              <div
                ref={observerTarget}
                className="w-full h-10 flex items-center justify-center my-4"
              >
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Loading more images...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <ImageDetailModal
        isOpen={isDetailModalOpen}
        onOpenChange={(isOpen) => {
          setIsDetailModalOpen(isOpen);
          if (!isOpen) setSelectedPinForDetail(null);
        }}
        pin={selectedPinForDetail}
        pins={pins}
        onNavigate={() => {}} // No navigation in explore mode
        onAddAudio={handleAddAudio} // Enable audio functionality
        isExploreMode={true}
      />

      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} PollenBoard. Powered by
          Pollinations.AI & Firebase Studio.
        </p>
      </footer>
    </div>
  );
}
