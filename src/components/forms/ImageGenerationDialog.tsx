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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateImageAction, GenerateImageActionResult } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ImageModelId } from "@/types";
import { SpeechInput } from "@/components/SpeechInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Wand2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  model: z.string().optional(),
  width: z.coerce.number().min(64).max(2048).optional(),
  height: z.coerce.number().min(64).max(2048).optional(),
  seed: z.string().optional(), // Seed can be any string for Pollinations
  enhance: z.boolean().default(false),
});

type ImageFormValues = z.infer<typeof formSchema>;

interface ImageGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImageGenerated: (result: GenerateImageActionResult) => void;
  imageModels: ImageModelId[];
}

export function ImageGenerationDialog({
  isOpen,
  onOpenChange,
  onImageGenerated,
  imageModels,
}: ImageGenerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      enhance: false,
      width: 1024,
      height: 1024,
    },
  });

  async function onSubmit(values: ImageFormValues) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("prompt", values.prompt);
    if (values.model) formData.append("model", values.model);
    if (values.width) formData.append("width", values.width.toString());
    if (values.height) formData.append("height", values.height.toString());
    if (values.seed) formData.append("seed", values.seed);
    formData.append("enhance", values.enhance.toString());

    try {
      const result = await generateImageAction(formData);
      if (result.error) {
        toast({
          title: "Error Generating Image",
          description: result.error,
          variant: "destructive",
        });
      } else {
        onImageGenerated(result);
        toast({
          title: "Image Generation Started",
          description: "Your image is being created.",
        });
        onOpenChange(false); // Close dialog on success
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit image generation request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePromptTranscription = (text: string) => {
    form.setValue("prompt", text);
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            Generate New Image
          </DialogTitle>
          <DialogDescription>
            Describe the image you want to create. Be as specific or creative as
            you like!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base">
              Prompt
            </Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="prompt"
                placeholder="e.g., A cat astronaut riding a unicorn on Mars, cinematic lighting"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model (Optional)</Label>
              <Select
                onValueChange={(value) => form.setValue("model", value)}
                defaultValue={form.getValues("model")}
              >
                <SelectTrigger id="model" className="focus:ring-primary">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {imageModels
                    .filter((modelId) => modelId !== "kontext") // Remove kontext from text-to-image options
                    .map((modelId) => (
                      <SelectItem key={modelId} value={modelId}>
                        {modelId}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (Optional)</Label>
              <Input
                id="seed"
                placeholder="e.g., 42 or random_string"
                {...form.register("seed")}
                className="focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="1024"
                {...form.register("width")}
                className="focus:ring-primary"
              />
              {form.formState.errors.width && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.width.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                placeholder="1024"
                {...form.register("height")}
                className="focus:ring-primary"
              />
              {form.formState.errors.height && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.height.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="enhance"
              checked={form.watch("enhance")}
              onCheckedChange={(checked) => form.setValue("enhance", !!checked)}
            />
            <Label
              htmlFor="enhance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enhance prompt with AI for more detail
            </Label>
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
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2" size="sm" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
