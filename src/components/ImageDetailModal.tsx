"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Calendar,
  Settings,
  Palette,
  Hash,
  Headphones,
  AudioLines,
} from "lucide-react";
import { PinData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { GenerateAudioModal } from "@/components/GenerateAudioModal";

interface ImageDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pin: PinData | null;
  pins: PinData[];
  onNavigate?: (pin: PinData) => void;
  onAddAudio?: (pin: PinData) => void;
  onTransformImage?: (pin: PinData) => void;
  isExploreMode?: boolean;
}

export function ImageDetailModal({
  isOpen,
  onOpenChange,
  pin,
  pins,
  onNavigate,
  onAddAudio,
  onTransformImage,
  isExploreMode = false,
}: ImageDetailModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const { toast } = useToast();

  const currentIndex = pin ? pins.findIndex((p) => p.id === pin.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < pins.length - 1;

  useEffect(() => {
    if (pin?.imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [pin?.imageUrl]);

  const handleCopyPrompt = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadImage = async () => {
    if (!pin?.imageUrl) return;

    try {
      toast({
        title: "Downloading...",
        description: "Preparing your image for download",
      });

      // Fetch the image data
      const response = await fetch(pin.imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      // Create a blob URL and download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `pollenboard-${pin.id}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Downloaded!",
        description: "Image saved to your downloads folder",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description:
          "Unable to download image. You can right-click the image to save it manually.",
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (!pin) return;

    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < pins.length) {
      const newPin = pins[newIndex];
      onNavigate?.(newPin);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!pin) return null;

  // Handle audio generation
  const handleAudioGenerated = (audioUrl: string, audioPrompt: string) => {
    if (!pin) return;

    // Create an updated pin with audio information
    const updatedPin: PinData = {
      ...pin,
      audioUrl,
      audioPrompt,
    };

    // Call the parent component's onAddAudio function with the updated pin
    onAddAudio?.(updatedPin);

    toast({
      title: "Audio added",
      description: "Audio has been successfully added to this image",
    });
  };

  // Handle the "Add Audio" button click
  const handleAddAudioClick = () => {
    if (!pin) return;
    setIsAudioModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex h-[85vh]">
            {/* Image Section */}
            <div className="flex-1 relative bg-black/5 flex items-center justify-center">
              {imageLoading && (
                <div className="w-full h-96 bg-muted animate-pulse rounded-lg" />
              )}

              {!imageLoading && imageError && (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Failed to load image</p>
                </div>
              )}

              {!imageError && pin.imageUrl && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={pin.imageUrl}
                    alt={pin.finalPrompt || "AI Generated Image"}
                    width={pin.width}
                    height={pin.height}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    priority={true} // Prioritize loading the modal image
                    quality={90} // Higher quality for the detailed view
                    unoptimized // This is crucial to prevent Next.js from altering the URL
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    sizes="(max-width: 768px) 100vw, 80vw" // Responsive sizing
                  />
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Arrows */}
              {hasPrevious && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={() => handleNavigate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {hasNext && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={() => handleNavigate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Close Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Details Panel */}
            <div className="w-96 border-l bg-background flex flex-col">
              <DialogHeader className="p-6 pb-4 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold">
                  Image Details
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-6 pb-6">
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadImage}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {onAddAudio && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddAudioClick}
                          className="flex-1"
                        >
                          <AudioLines className="h-4 w-4 mr-2" />
                          {pin.audioUrl ? "Change" : "Add"} Audio
                        </Button>
                      )}
                      {onTransformImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTransformImage(pin)}
                          className="flex-1 mt-2 w-full"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Transform with Kontext
                        </Button>
                      )}
                    </div>

                    {/* Original Prompt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm flex items-center">
                          <Palette className="h-4 w-4 mr-2" />
                          Original Prompt
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyPrompt(
                              pin.originalPrompt,
                              "Original prompt"
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                        {pin.originalPrompt}
                      </div>
                    </div>

                    {/* Enhanced Prompt (if different) */}
                    {pin.finalPrompt !== pin.originalPrompt && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Enhanced Prompt
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyPrompt(
                                pin.finalPrompt,
                                "Enhanced prompt"
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                          {pin.finalPrompt}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Technical Details */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Technical Details</h3>

                      <div className="grid grid-cols-2 gap-3">
                        {pin.modelUsed && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Model
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xs break-all"
                            >
                              {pin.modelUsed}
                            </Badge>
                          </div>
                        )}

                        {pin.seed && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              Seed
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono break-all"
                            >
                              {pin.seed}
                            </Badge>
                          </div>
                        )}

                        {pin.width && pin.height && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Dimensions
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {pin.width}×{pin.height}
                            </Badge>
                          </div>
                        )}

                        {pin.quality && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Quality
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {pin.quality}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {pin.negativePrompt && (
                        <div className="space-y-1 mt-3">
                          <p className="text-xs text-muted-foreground">
                            Negative Prompt
                          </p>
                          <p className="text-xs p-2 bg-muted rounded-md break-all">
                            {pin.negativePrompt}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created
                        </p>
                        <p className="text-sm">{formatDate(pin.createdAt)}</p>
                      </div>
                    </div>

                    {/* Audio Section */}
                    {pin.audioUrl && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="font-medium text-sm flex items-center">
                            <Headphones className="h-4 w-4 mr-2" />
                            Attached Audio
                          </h3>

                          <audio
                            controls
                            src={pin.audioUrl}
                            className="w-full rounded-md"
                          >
                            Your browser does not support the audio element.
                          </audio>

                          {pin.audioPrompt && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  Audio Prompt
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyPrompt(
                                      pin.audioPrompt!,
                                      "Audio prompt"
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">
                                {pin.audioPrompt}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Navigation Info */}
                    {pins.length > 1 && (
                      <>
                        <Separator />
                        <div className="text-center text-sm text-muted-foreground">
                          {currentIndex + 1} of {pins.length} images
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audio Generation Modal */}
      <GenerateAudioModal
        isOpen={isAudioModalOpen}
        onOpenChange={setIsAudioModalOpen}
        onAudioGenerated={handleAudioGenerated}
      />
    </>
  );
}
