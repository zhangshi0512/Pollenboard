"use client";

import { useState, useEffect } from "react";
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
  generateImageFromImageAction,
  GenerateImageFromImageActionResult,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SpeechInput } from "@/components/SpeechInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Wand2, Upload } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  sourceImageUrl: z.string().min(1, "Source image is required."),
});

type ImageToImageFormValues = z.infer<typeof formSchema>;

interface ImageToImageDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImageGenerated: (result: GenerateImageFromImageActionResult) => void;
  initialImageUrl?: string;
}

export function ImageToImageDialog({
  isOpen,
  onOpenChange,
  onImageGenerated,
  initialImageUrl = "",
}: ImageToImageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<ImageToImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "transform this image",
      sourceImageUrl: initialImageUrl,
    },
  });

  // Update form when initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      form.setValue("sourceImageUrl", initialImageUrl);
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        prompt: "transform this image",
        sourceImageUrl: initialImageUrl,
      });
      setPreviewUrl(initialImageUrl || null);
      setUploadedFile(null);
    }
  }, [isOpen, form, initialImageUrl]);

  async function onSubmit(values: ImageToImageFormValues) {
    setIsLoading(true);

    try {
      // If we have an uploaded file, we need to create a URL for it
      let sourceImageUrl = values.sourceImageUrl;

      if (uploadedFile) {
        // For uploaded files, we need to create a data URL
        const reader = new FileReader();

        // Create a promise to handle the FileReader async operation
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(uploadedFile);
        });

        sourceImageUrl = dataUrl;
      }

      const formData = new FormData();
      formData.append("prompt", values.prompt);
      formData.append("sourceImageUrl", sourceImageUrl);

      const result = await generateImageFromImageAction(formData);

      if (result.error) {
        toast({
          title: "Error Generating Image",
          description: result.error,
          variant: "destructive",
        });
      } else {
        onImageGenerated(result);
        toast({
          title: "Image Transformation Started",
          description: "Your image is being transformed with Kontext model.",
        });
        onOpenChange(false); // Close dialog on success
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit image transformation request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePromptTranscription = (text: string) => {
    form.setValue("prompt", text);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    form.setValue("sourceImageUrl", "uploaded-file"); // Placeholder value
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            Transform Image with Kontext
          </DialogTitle>
          <DialogDescription>
            Upload an image or use an existing one and transform it with the
            Kontext model.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          {/* Source Image Section */}
          <div className="space-y-2">
            <Label htmlFor="sourceImage" className="text-base">
              Source Image
            </Label>
            <div className="flex flex-col gap-4">
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Source image preview"
                    fill
                    className="object-contain"
                    onError={() => {
                      setPreviewUrl(null);
                      toast({
                        title: "Image Error",
                        description: "Failed to load image preview",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              )}

              {/* Image URL Input */}
              {!uploadedFile && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sourceImageUrl">Image URL</Label>
                  <Input
                    id="sourceImageUrl"
                    placeholder="https://example.com/image.jpg"
                    {...form.register("sourceImageUrl")}
                    className="focus:ring-primary"
                  />
                  {form.formState.errors.sourceImageUrl && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.sourceImageUrl.message}
                    </p>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 border-muted-foreground/25 hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base">
              Transformation Prompt
            </Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="prompt"
                placeholder="e.g., transform this image into a watercolor painting"
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

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !previewUrl}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2" size="sm" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Transform Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
