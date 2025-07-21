"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AudioLines, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerateAudioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAudioGenerated: (audioUrl: string, audioPrompt: string) => void;
}

export function GenerateAudioModal({
  isOpen,
  onOpenChange,
  onAudioGenerated,
}: GenerateAudioModalProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Available voices from OpenAI
  const voices = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" },
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setText("");
      setVoice("alloy");
      setAudioPreview(null);
    }
  }, [isOpen]);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setAudioPreview(null);

    try {
      // Use the Pollinations.AI text-to-speech API
      const encodedText = encodeURIComponent(text);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;

      // Verify the audio URL works by fetching it
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(`Failed to generate audio: ${response.statusText}`);
      }

      // Create a blob URL for preview
      const audioBlob = await response.blob();
      const audioBlobUrl = URL.createObjectURL(audioBlob);
      setAudioPreview(audioBlobUrl);

      toast({
        title: "Audio generated",
        description: "Your audio has been successfully generated",
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (audioPreview) {
      // Pass the audio URL and prompt text back to the parent component
      const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(
        text
      )}?model=openai-audio&voice=${voice}`;
      onAudioGenerated(audioUrl, text);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AudioLines className="h-5 w-5" />
            Generate Audio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-synthesize">Text to Synthesize</Label>
            <Textarea
              id="text-to-synthesize"
              placeholder="Enter text to convert to speech"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {audioPreview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <audio controls src={audioPreview} className="w-full rounded-md">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateAudio}
              disabled={!text.trim() || isGenerating}
              variant="secondary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Preview"
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!audioPreview || isGenerating}
            >
              Save Audio
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
