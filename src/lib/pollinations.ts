import type { ImageModelId, TextModelsApiResponse, Voice } from '@/types';

const POLLINATIONS_IMAGE_MODELS_URL = 'https://image.pollinations.ai/models';
const POLLINATIONS_TEXT_MODELS_URL = 'https://text.pollinations.ai/models';

export async function fetchImageModels(): Promise<ImageModelId[]> {
  try {
    const response = await fetch(POLLINATIONS_IMAGE_MODELS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch image models: ${response.statusText}`);
    }
    const data: ImageModelId[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching image models:", error);
    return []; // Return empty array on error
  }
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

    if (data['openai-audio'] && data['openai-audio'].voices) {
      voices = data['openai-audio'].voices.map(voiceId => ({ id: voiceId, name: voiceId.charAt(0).toUpperCase() + voiceId.slice(1) }));
    }
    
    return { textModelIds, voices };
  } catch (error) {
    console.error("Error fetching text models and voices:", error);
    return { textModelIds: [], voices: [] }; // Return empty arrays on error
  }
}
