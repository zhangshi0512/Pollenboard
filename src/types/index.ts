
export interface PinData {
  id: string;
  imageUrl: string;
  originalPrompt: string;
  finalPrompt: string;
  audioUrl?: string;
  audioPrompt?: string;
  width?: number;
  height?: number;
  createdAt: string; // ISO string date
  modelUsed?: string;
  seed?: string;
}

export interface ImageModel {
  id: string;
  name: string;
}

// Based on Pollinations API docs, /models for text returns various structures
// This is a flexible type, may need adjustment based on actual API response
export interface TextModelInfo {
  id: string;
  name?: string; // Some models might just be IDs
  voices?: string[]; // For 'openai-audio' model
  // Add other properties if API provides more details
}

export interface Voice {
  id: string;
  name: string;
}

// For Pollinations image.pollinations.ai/models (seems to be an array of strings)
export type ImageModelId = string;

// For Pollinations text.pollinations.ai/models
// The structure is complex, might contain models as keys and their properties as values
// Example: "openai-audio": { "voices": ["alloy", "echo", ...] }
export interface TextModelsApiResponse {
  [modelId: string]: {
    voices?: string[];
    // other model-specific properties
  };
}
