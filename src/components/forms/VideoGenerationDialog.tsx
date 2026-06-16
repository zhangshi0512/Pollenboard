"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { createVideoAction, pollVideoAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SpeechInput } from "@/components/SpeechInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Wand2, Video, Film, Eye } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  sourceImageUrl: z.string().optional(),
  width: z.coerce.number().min(64).max(2048).default(1152),
  height: z.coerce.number().min(64).max(2048).default(768),
  num_frames: z.coerce.number().default(121),
  frame_rate: z.coerce.number().default(24),
});

type VideoFormValues = z.infer<typeof formSchema>;

interface VideoGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onVideoGenerated: (videoUrl: string, prompt: string, imageUrl?: string) => void;
  initialImageUrl?: string;
  initialPrompt?: string;
}

export function VideoGenerationDialog({
  isOpen,
  onOpenChange,
  onVideoGenerated,
  initialImageUrl = "",
  initialPrompt = "",
}: VideoGenerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      sourceImageUrl: initialImageUrl,
      width: 1152,
      height: 768,
      num_frames: 121,
      frame_rate: 24,
    },
  });

  // Update when initial properties change
  useEffect(() => {
    if (initialImageUrl) {
      form.setValue("sourceImageUrl", initialImageUrl);
    }
    if (initialPrompt) {
      form.setValue("prompt", initialPrompt);
    }
  }, [initialImageUrl, initialPrompt, form]);

  // Clean up polling on unmount or close
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setIsLoading(false);
      setProgress(0);
      setStatus(null);
    }
  }, [isOpen]);

  const handlePromptTranscription = (text: string) => {
    form.setValue("prompt", text);
  };

  async function onSubmit(values: VideoFormValues) {
    setIsLoading(true);
    setProgress(0);
    setStatus("submitting");

    const formData = new FormData();
    formData.append("prompt", values.prompt);
    if (values.sourceImageUrl) {
      formData.append("imageUrl", values.sourceImageUrl);
    }
    formData.append("width", values.width.toString());
    formData.append("height", values.height.toString());
    formData.append("num_frames", values.num_frames.toString());
    formData.append("frame_rate", values.frame_rate.toString());

    try {
      const response = await createVideoAction(formData);

      if (response.error || !response.videoId) {
        toast({
          title: "Error Starting Video Generation",
          description: response.error || "Failed to start generation.",
          variant: "destructive",
        });
        setIsLoading(false);
        setStatus(null);
        return;
      }

      const videoId = response.videoId;
      setStatus(response.status || "queued");
      toast({
        title: "Video Generation Queued",
        description: "Your video generation has started.",
      });

      // Start polling
      pollingRef.current = setInterval(async () => {
        try {
          const pollResponse = await pollVideoAction(videoId);

          if (pollResponse.error) {
            console.error("Polling error:", pollResponse.error);
            return; // Try again next interval
          }

          if (pollResponse.progress !== undefined) {
            setProgress(pollResponse.progress);
          }

          if (pollResponse.status) {
            setStatus(pollResponse.status);
          }

          if (pollResponse.status === "completed" && pollResponse.videoUrl) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            onVideoGenerated(pollResponse.videoUrl, values.prompt, values.sourceImageUrl);
            toast({
              title: "Video Generation Completed!",
              description: "Your video has been saved to your board.",
            });
            onOpenChange(false);
            form.reset();
          } else if (pollResponse.status === "failed") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            toast({
              title: "Video Generation Failed",
              description: pollResponse.error || "The AI model failed to generate this video.",
              variant: "destructive",
            });
            setIsLoading(false);
            setStatus(null);
          }
        } catch (pollError) {
          console.error("Error during status polling:", pollError);
        }
      }, 5000); // Poll every 5 seconds as recommended

    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit video generation request.",
        variant: "destructive",
      });
      setIsLoading(false);
      setStatus(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Video className="w-6 h-6" /> Generate AI Video
          </DialogTitle>
          <DialogDescription>
            Create high-quality cinematic videos using the Agnes-Video-V2.0 model.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <LoadingSpinner className="w-12 h-12 text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">Generating Your Video...</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                Status: {status} ({progress}%)
              </p>
            </div>
            <div className="w-full max-w-xs px-4">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-[320px]">
              Video generation can take between 30 seconds to a few minutes. Please keep this dialog open.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-base">
                Video Prompt
              </Label>
              <div className="flex items-center gap-2">
                <Textarea
                  id="prompt"
                  placeholder="e.g., A cinematic tracking shot of a cute cat walking on the beach at sunset, warm golden lighting"
                  {...form.register("prompt")}
                  className="min-h-[100px] text-base focus:ring-primary"
                  aria-invalid={form.formState.errors.prompt ? "true" : "false"}
                />
                <SpeechInput onTranscription={handlePromptTranscription} />
              </div>
              {form.formState.errors.prompt && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.prompt.message}
                </p>
              )}
            </div>

            {form.watch("sourceImageUrl") && (
              <div className="space-y-2">
                <Label>Source Image (Image-to-Video Mode)</Label>
                <div className="relative w-full h-[150px] rounded-lg overflow-hidden border border-border">
                  <Image
                    src={form.watch("sourceImageUrl")!}
                    alt="Source image preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7 px-2"
                    onClick={() => form.setValue("sourceImageUrl", "")}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspect-ratio">Aspect Ratio / Size</Label>
                <Select
                  onValueChange={(value) => {
                    const [w, h] = value.split("x");
                    form.setValue("width", parseInt(w));
                    form.setValue("height", parseInt(h));
                  }}
                  defaultValue="1152x768"
                >
                  <SelectTrigger id="aspect-ratio" className="focus:ring-primary">
                    <SelectValue placeholder="Select Aspect Ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1152x768">16:9 (1152x768)</SelectItem>
                    <SelectItem value="768x1152">9:16 (768x1152)</SelectItem>
                    <SelectItem value="1024x1024">1:1 (1024x1024)</SelectItem>
                    <SelectItem value="1024x768">4:3 (1024x768)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Video Duration (seconds)</Label>
                <Select
                  onValueChange={(value) => {
                    const frames = parseInt(value);
                    form.setValue("num_frames", frames);
                    form.setValue("frame_rate", 24); // Recommend 24 FPS
                  }}
                  defaultValue="121"
                >
                  <SelectTrigger id="duration" className="focus:ring-primary">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="81">~3 Seconds (81 frames @ 24fps)</SelectItem>
                    <SelectItem value="121">~5 Seconds (121 frames @ 24fps)</SelectItem>
                    <SelectItem value="241">~10 Seconds (241 frames @ 24fps)</SelectItem>
                    <SelectItem value="441">~18 Seconds (441 frames @ 24fps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Film className="w-4 h-4" /> Generate Video
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
