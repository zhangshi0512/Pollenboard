"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateTextAction, GenerateTextActionResult } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SpeechInput } from "@/components/SpeechInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MessageSquare } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
});

type TextGenerationFormValues = z.infer<typeof formSchema>;

interface TextGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTextGenerated: (result: GenerateTextActionResult) => void;
}

export function TextGenerationDialog({
  isOpen,
  onOpenChange,
  onTextGenerated,
}: TextGenerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TextGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: TextGenerationFormValues) {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", values.prompt);

      const result = await generateTextAction(formData);

      if (result.error) {
        toast({
          title: "Error Generating Text",
          description: result.error,
          variant: "destructive",
        });
      } else {
        onTextGenerated(result);
        toast({
          title: "Text Generated",
          description: "Your text has been generated successfully.",
        });
        onOpenChange(false); // Close dialog on success
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit text generation request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePromptTranscription = (text: string) => {
    form.setValue("prompt", text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            Generate Text with Pollinations.ai
          </DialogTitle>
          <DialogDescription>
            Enter a prompt to generate text using Pollinations.ai's text
            generation service.
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
                placeholder="e.g., Explain why the sky is blue in simple terms"
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
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <LoadingSpinner className="mr-2" size="sm" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Generate Text
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
