"use client";

import Image from "next/image";
import type { PollinationsFeedItem } from "@/app/api/pollinations-feed/route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExplorePinCardProps {
  feedItem: PollinationsFeedItem;
  onImageClick: (feedItem: PollinationsFeedItem) => void;
}

export function ExplorePinCard({
  feedItem,
  onImageClick,
}: ExplorePinCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Use intersection observer to detect when the image is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading when image is 200px from viewport
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Only load image when it's in view
  useEffect(() => {
    if (!isInView) return;

    // Use thumbnailURL if available, otherwise fall back to imageURL
    const imageUrl = feedItem.thumbnailURL || feedItem.imageURL;

    if (imageUrl) {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [feedItem.thumbnailURL, feedItem.imageURL, isInView]);

  const getAIGenerationHint = (promptText: string) => {
    if (!promptText) return "abstract";
    const words = promptText.split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return promptText;
  };

  const getModelBadgeColor = (model: string) => {
    switch (model.toLowerCase()) {
      case "flux":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "turbo":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "playground":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Card className="break-inside-avoid mb-4 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 border-l-primary/20">
      <CardHeader className="p-0 relative">
        {imageLoading && (
          <div
            className="w-full bg-muted animate-pulse"
            style={{
              aspectRatio: `${feedItem.width}/${feedItem.height}`,
            }}
          ></div>
        )}
        {!imageLoading && imageError && (
          <Image
            src={`https://placehold.co/600x400.png`}
            alt="Placeholder image due to error"
            width={feedItem.width || 600}
            height={feedItem.height || 400}
            className="w-full h-auto object-cover"
            data-ai-hint="placeholder error"
          />
        )}
        <div ref={imageRef}>
          {isInView &&
            !imageLoading &&
            !imageError &&
            (feedItem.thumbnailURL || feedItem.imageURL) && (
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                onClick={() => onImageClick(feedItem)}
              >
                <Image
                  src={feedItem.thumbnailURL || feedItem.imageURL}
                  alt={feedItem.prompt || "AI Generated Image"}
                  width={400} // Use smaller dimensions for thumbnails
                  height={400}
                  className="w-full h-auto object-cover transition-opacity duration-500 opacity-100"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  quality={80} // Slightly lower quality for thumbnails
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  data-ai-hint={getAIGenerationHint(feedItem.prompt)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white/90 rounded-full p-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="secondary"
            className={getModelBadgeColor(feedItem.model)}
          >
            {feedItem.model.toUpperCase()}
          </Badge>
          {feedItem.enhance && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Enhanced
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This prompt was enhanced by AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="text-xs text-muted-foreground truncate cursor-help mb-2">
                <Info size={12} className="inline mr-1" />
                Seed: {feedItem.seed} • {feedItem.width}×{feedItem.height}
                {feedItem.quality && ` • ${feedItem.quality}`}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p>
                  <strong>Model:</strong> {feedItem.model}
                </p>
                <p>
                  <strong>Seed:</strong> {feedItem.seed}
                </p>
                <p>
                  <strong>Dimensions:</strong> {feedItem.width}×
                  {feedItem.height}
                </p>
                <p>
                  <strong>Quality:</strong> {feedItem.quality}
                </p>
                {feedItem.negative_prompt && (
                  <p>
                    <strong>Negative Prompt:</strong> {feedItem.negative_prompt}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <CardTitle className="text-sm font-normal line-clamp-4 leading-relaxed">
          {feedItem.prompt}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
