import type { ImageModelId, TextModelsApiResponse, Voice } from "@/types";

const POLLINATIONS_TEXT_MODELS_URL = "https://text.pollinations.ai/models";

// Allowed image models - restricted to only these options
const ALLOWED_IMAGE_MODELS: ImageModelId[] = ["flux", "zimage", "turbo"];

export async function fetchImageModels(): Promise<ImageModelId[]> {
  // Return only the allowed models (flux, zimage, turbo)
  // Previously this fetched from the API, but we now restrict to specific models
  return ALLOWED_IMAGE_MODELS;
}

interface TextModelsAndVoices {
  textModelIds: string[];
  voices: Voice[];
}

export async function fetchTextModelsAndVoices(): Promise<TextModelsAndVoices> {
  try {
    const response = await fetch(POLLINATIONS_TEXT_MODELS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch text models: ${response.statusText}`);
    }
    const data: TextModelsApiResponse = await response.json();

    const textModelIds = Object.keys(data);
    let voices: Voice[] = [];

    if (data["openai-audio"] && data["openai-audio"].voices) {
      voices = data["openai-audio"].voices.map((voiceId) => ({
        id: voiceId,
        name: voiceId.charAt(0).toUpperCase() + voiceId.slice(1),
      }));
    }

    return { textModelIds, voices };
  } catch (error) {
    console.error("Error fetching text models and voices:", error);
    // Provide default OpenAI voices when API fails
    const defaultVoices: Voice[] = [
      { id: "alloy", name: "Alloy" },
      { id: "echo", name: "Echo" },
      { id: "fable", name: "Fable" },
      { id: "onyx", name: "Onyx" },
      { id: "nova", name: "Nova" },
      { id: "shimmer", name: "Shimmer" },
    ];
    return { textModelIds: ["openai-audio"], voices: defaultVoices };
  }
}
