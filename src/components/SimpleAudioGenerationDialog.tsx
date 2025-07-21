"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerateAudioActionResult } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Voice } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Volume2, Waves, Play, Pause } from "lucide-react";

interface SimpleAudioGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAudioGenerated: (result: GenerateAudioActionResult) => void;
  initialPrompt?: string;
}

export function SimpleAudioGenerationDialog({
  isOpen,
  onOpenChange,
  onAudioGenerated,
  initialPrompt = "",
}: SimpleAudioGenerationDialogProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [voice, setVoice] = useState("alloy");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Default voices
  const voices = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" },
  ];

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setVoice("alloy");
      setPreviewUrl(null);
      setIsPreviewPlaying(false);
    }
  }, [isOpen, initialPrompt]);

  // Function to generate preview audio
  const handleGeneratePreview = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPreview(true);
    setPreviewUrl(null);

    try {
      const encodedText = encodeURIComponent(prompt);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;

      const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      // Verify the audio URL works by fetching it through the proxy
      const response = await fetch(proxiedUrl);

      if (!response.ok) {
        throw new Error(`Failed to generate audio: ${response.statusText}`);
      }

      // Set the preview URL to the proxied URL
      setPreviewUrl(proxiedUrl);

      toast({
        title: "Preview ready",
        description: "Your audio preview is ready to play",
      });
    } catch (error) {
      console.error("Preview generation error:", error);
      toast({
        title: "Preview failed",
        description: "Failed to generate audio preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Function to toggle audio playback
  const toggleAudioPlayback = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPreviewPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPreviewPlaying(!isPreviewPlaying);
  };

  // Handle audio events
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleEnded = () => setIsPreviewPlaying(false);
    const handlePause = () => setIsPreviewPlaying(false);
    const handlePlay = () => setIsPreviewPlaying(true);

    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("play", handlePlay);

    return () => {
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("play", handlePlay);
    };
  }, [previewUrl]);

  const handleSaveAudio = async () => {
    // If we already have a preview, use that
    if (previewUrl) {
      // The preview URL is the proxied URL. We need to extract the original URL from it.
      const urlParams = new URLSearchParams(previewUrl.split("?")[1]);
      const originalUrl = urlParams.get("url");

      onAudioGenerated({
        audioDataUri: originalUrl || previewUrl, // Fallback to previewUrl if parsing fails
        prompt: prompt,
      });

      toast({
        title: "Audio Added",
        description: "Audio has been successfully added to your image.",
      });
      onOpenChange(false);
      return;
    }

    // If no preview, generate the audio directly
    setIsLoading(true);

    try {
      // Generate the audio URL directly using Pollinations.AI API
      const encodedText = encodeURIComponent(prompt);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
      const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;

      // Verify the audio URL works by fetching it through the proxy
      const response = await fetch(proxiedUrl);

      if (!response.ok) {
        throw new Error(`Failed to generate audio: ${response.statusText}`);
      }

      // Use the direct URL
      onAudioGenerated({
        audioDataUri: audioUrl,
        prompt: prompt,
      });

      toast({
        title: "Audio Added",
        description: "Audio has been successfully added to your image.",
      });
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Audio generation error:", error);
      toast({
        title: "Audio Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            Generate Audio
          </DialogTitle>
          <DialogDescription>
            Enter text to convert to speech. Choose a voice for your audio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 p-2">
          <div className="space-y-2">
            <Label htmlFor="audio-prompt" className="text-base">
              Text to Synthesize
            </Label>
            <Textarea
              id="audio-prompt"
              placeholder="e.g., Hello world, welcome to PollenBoard!"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-base focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="voice" className="focus:ring-primary">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Audio Section */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleAudioPlayback}
                  className="flex-shrink-0"
                >
                  {isPreviewPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-full bg-muted rounded-md h-10 flex items-center px-3">
                  <audio
                    ref={audioRef}
                    src={previewUrl}
                    className="hidden"
                    preload="auto"
                  />
                  <Waves className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Audio preview ready
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isGeneratingPreview}
            >
              Cancel
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleGeneratePreview}
                disabled={isLoading || isGeneratingPreview || !prompt.trim()}
              >
                {isGeneratingPreview ? (
                  <LoadingSpinner className="mr-2" size="sm" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Generate Preview
              </Button>

              <Button
                type="button"
                onClick={handleSaveAudio}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <LoadingSpinner className="mr-2" size="sm" />
                ) : (
                  <Volume2 className="mr-2 h-4 w-4" />
                )}
                {previewUrl ? "Save Audio" : "Generate Audio"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
