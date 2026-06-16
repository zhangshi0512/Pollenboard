import type { ImageModelId, Voice } from "@/types";

// Allowed image models - restricted to Agnes AI
const ALLOWED_IMAGE_MODELS: ImageModelId[] = ["agnes-image-2.1-flash"];

export async function fetchImageModels(): Promise<ImageModelId[]> {
  return ALLOWED_IMAGE_MODELS;
}

interface TextModelsAndVoices {
  textModelIds: string[];
  voices: Voice[];
}

export async function fetchTextModelsAndVoices(): Promise<TextModelsAndVoices> {
  // Provide Agnes AI text models and default OpenAI voices
  const defaultVoices: Voice[] = [
    { id: "alloy", name: "Alloy" },
    { id: "echo", name: "Echo" },
    { id: "fable", name: "Fable" },
    { id: "onyx", name: "Onyx" },
    { id: "nova", name: "Nova" },
    { id: "shimmer", name: "Shimmer" },
  ];
  return {
    textModelIds: ["agnes-2.0-flash"],
    voices: defaultVoices,
  };
}
