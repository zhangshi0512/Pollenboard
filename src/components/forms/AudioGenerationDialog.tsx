'use client';

import { useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAudioAction, GenerateAudioActionResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Voice } from '@/types';
import { SpeechInput } from '@/components/SpeechInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Volume2, Waves } from 'lucide-react';

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  voice: z.string().optional(),
});

type AudioFormValues = z.infer<typeof formSchema>;

interface AudioGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAudioGenerated: (result: GenerateAudioActionResult) => void;
  voices: Voice[];
  initialPrompt?: string;
}

export function AudioGenerationDialog({
  isOpen,
  onOpenChange,
  onAudioGenerated,
  voices,
  initialPrompt = "",
}: AudioGenerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AudioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      voice: voices.length > 0 ? voices[0].id : undefined,
    },
  });
  
  useEffect(() => {
    form.reset({ prompt: initialPrompt, voice: voices.length > 0 ? voices[0].id : undefined });
  }, [initialPrompt, voices, form, isOpen]);


  async function onSubmit(values: AudioFormValues) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('prompt', values.prompt);
    if (values.voice) formData.append('voice', values.voice);

    try {
      const result = await generateAudioAction(formData);
      if (result.error) {
        toast({ title: "Error Generating Audio", description: result.error, variant: "destructive" });
      } else {
        onAudioGenerated(result);
        toast({ title: "Audio Generation Started", description: "Your audio is being created.", icon: <Waves className="h-5 w-5 text-primary" /> });
        onOpenChange(false); // Close dialog on success
      }
    } catch (error) {
      toast({ title: "Submission Error", description: "Failed to submit audio generation request.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePromptTranscription = (text: string) => {
    form.setValue("prompt", text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Generate Audio</DialogTitle>
          <DialogDescription>
            Enter text to convert to speech. Choose a voice for your audio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <div className="space-y-2">
            <Label htmlFor="audio-prompt" className="text-base">Text to Synthesize</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="audio-prompt"
                placeholder="e.g., Hello world, welcome to PollenBoard!"
                {...form.register("prompt")}
                className="min-h-[100px] text-base focus:ring-primary"
                aria-invalid={form.formState.errors.prompt ? "true" : "false"}
              />
              <SpeechInput onTranscription={handlePromptTranscription} />
            </div>
            {form.formState.errors.prompt && (
              <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select 
              onValueChange={(value) => form.setValue('voice', value)} 
              defaultValue={form.getValues('voice')}
              disabled={voices.length === 0}
            >
              <SelectTrigger id="voice" className="focus:ring-primary">
                <SelectValue placeholder={voices.length > 0 ? "Select a voice" : "No voices available"} />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {voices.length === 0 && <p className="text-sm text-muted-foreground">Loading voices or none available.</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || voices.length === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? <LoadingSpinner className="mr-2" size="sm" /> : <Volume2 className="mr-2 h-4 w-4" />}
              Generate Audio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
