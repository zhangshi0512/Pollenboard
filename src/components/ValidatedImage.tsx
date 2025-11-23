"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface ValidatedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackText?: string;
  stabilize?: boolean; // keep a fixed box to avoid reflow
}

export function ValidatedImage({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  fallbackText = "Image failed to load",
  stabilize = true,
}: ValidatedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setIsValid(null);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  const validateImage = async (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      // Add a short cache-busting parameter to avoid CDN stale 502s
      const url = new URL(imageSrc, window.location.href);
      url.searchParams.set("_", String(Date.now() % 1_000_000));

      img.onload = () => {
        // Additional check for actual image dimensions
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      img.onerror = () => resolve(false);

      // Set timeout for slow loading images - pollinations can take 15-30s to generate
      const timeout = setTimeout(() => {
        img.src = ""; // Cancel loading
        resolve(false);
      }, 30000); // 30 second timeout

      img.src = url.toString();

      // Clear timeout if image loads successfully
      img.onload = () => {
        clearTimeout(timeout);
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
  };

  const handleRetry = async () => {
    if (retryCount < 3) {
      setIsLoading(true);
      setIsValid(null);

      // Add cache-busting parameter for retry
      const retrySrc = `${src}?retry=${retryCount}`;
      setCurrentSrc(retrySrc);
      setRetryCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkImage = async () => {
      if (!currentSrc) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      const isValidImage = await validateImage(currentSrc);

      if (isMounted) {
        setIsValid(isValidImage);
        setIsLoading(false);

        if (isValidImage) {
          onLoad?.();
        } else {
          onError?.();
        }
      }
    };

    checkImage();

    return () => {
      isMounted = false;
    };
  }, [currentSrc]);

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted/20 ${className}`}
      >
        <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center px-2">
          {fallbackText}
        </p>
        {retryCount < 3 && (
          <button
            onClick={handleRetry}
            className="mt-2 text-xs text-primary hover:text-primary/80 underline"
          >
            Retry ({retryCount + 1}/3)
          </button>
        )}
      </div>
    );
  }

  if (isValid === true) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={onLoad}
        onError={onError}
        style={stabilize ? { display: "block" } : undefined}
      />
    );
  }

  return null;
}
