'use client';

import Image from 'next/image';
import { PinData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioLines, Headphones, Edit3, Trash2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface PinItemCardProps {
  pin: PinData;
  onAddAudio: (pin: PinData) => void;
  onDeletePin?: (pinId: string) => void; // Optional delete functionality
}

export function PinItemCard({ pin, onAddAudio, onDeletePin }: PinItemCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    if (pin.imageUrl) {
      const img = new window.Image();
      img.src = pin.imageUrl;
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
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
  }, [pin.imageUrl]);


  const cardStyle = imageDimensions ? {
    aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
    // This helps with masonry if parent uses display: flex, flex-direction: column
    // For CSS columns, it's less critical but helps maintain aspect ratio internally
  } : {
    aspectRatio: '1 / 1', // Default aspect ratio if dimensions are not available
  };

  const getAIGenerationHint = (promptText: string) => {
    if (!promptText) return "abstract";
    const words = promptText.split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return promptText;
  }

  return (
    <Card className="break-inside-avoid mb-4 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="p-0 relative">
        {imageLoading && (
          <div className="w-full bg-muted animate-pulse" style={{ aspectRatio: pin.width && pin.height ? `${pin.width}/${pin.height}` : '4/3' }}></div>
        )}
        {!imageLoading && imageError && (
           <Image
            src={`https://placehold.co/600x400.png`}
            alt="Placeholder image due to error"
            width={pin.width || 600}
            height={pin.height || 400}
            className="w-full h-auto object-cover"
            data-ai-hint="placeholder error"
          />
        )}
        {!imageLoading && !imageError && pin.imageUrl && (
          <Image
            src={pin.imageUrl}
            alt={pin.finalPrompt || 'AI Generated Image'}
            width={pin.width || 600} // Provide default or actual width for optimization
            height={pin.height || Math.round((pin.width || 600) * (imageDimensions ? imageDimensions.height / imageDimensions.width : 0.75))}
            className="w-full h-auto object-cover transition-opacity duration-500 opacity-100"
            priority={false} // Lower priority for pins further down
            onLoadingComplete={() => setImageLoading(false)}
            onError={() => { setImageError(true); setImageLoading(false); }}
            data-ai-hint={getAIGenerationHint(pin.finalPrompt)}
          />
        )}
      </CardHeader>
      <CardContent className="p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardDescription className="text-xs text-muted-foreground truncate cursor-help">
                <Info size={12} className="inline mr-1" />
                Model: {pin.modelUsed || 'default'}, Seed: {pin.seed || 'random'}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent>
              <p>Original Prompt: {pin.originalPrompt}</p>
              {pin.originalPrompt !== pin.finalPrompt && <p>Enhanced Prompt: {pin.finalPrompt}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <CardTitle className="mt-1 text-sm font-normal line-clamp-3">{pin.finalPrompt}</CardTitle>
        
        {pin.audioUrl && (
          <div className="mt-3">
            <div className="flex items-center text-xs text-primary mb-1">
              <Headphones size={14} className="mr-1" />
              <span>Attached Audio</span>
            </div>
            <audio controls src={pin.audioUrl} className="w-full h-10 rounded-md">
              Your browser does not support the audio element.
            </audio>
            {pin.audioPrompt && <p className="text-xs text-muted-foreground mt-1 italic truncate">Prompt: {pin.audioPrompt}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 flex justify-between items-center border-t">
        <Button variant="ghost" size="sm" onClick={() => onAddAudio(pin)} className="text-primary hover:bg-primary/10">
          <AudioLines size={16} className="mr-2" />
          {pin.audioUrl ? 'Change Audio' : 'Add Audio'}
        </Button>
        {onDeletePin && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDeletePin(pin.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 size={16} />
                  <span className="sr-only">Delete Pin</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Pin</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
}
