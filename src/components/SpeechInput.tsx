"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transcribeAudioAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";

interface SpeechInputProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function SpeechInput({ onTranscription, className }: SpeechInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Error",
        description: "Audio recording is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        }); // webm is widely supported
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsLoading(true);
          try {
            const result = await transcribeAudioAction(base64Audio, "webm");
            if (result.error) {
              toast({
                title: "Transcription Error",
                description: result.error,
                variant: "destructive",
              });
            } else if (result.transcription) {
              onTranscription(result.transcription);
              toast({ title: "Success", description: "Text transcribed!" });
            }
          } catch (error) {
            toast({
              title: "Transcription Error",
              description: "Failed to transcribe audio.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        };
        // Stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description:
          "Could not start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      disabled={isLoading}
      className={className}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5 text-red-500" />
      ) : (
        <Mic className="h-5 w-5 text-primary" />
      )}
    </Button>
  );
}
