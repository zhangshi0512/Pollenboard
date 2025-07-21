"use server";

import {
  generateImageFromPrompt,
  GenerateImageFromPromptInput,
} from "@/ai/flows/generate-image-from-prompt";
import {
  enhancePromptForBetterImage,
  EnhancePromptForBetterImageInput,
} from "@/ai/flows/enhance-prompt-for-better-image";
import {
  generateAudioFromText,
  GenerateAudioFromTextInput,
} from "@/ai/flows/generate-audio-from-text";
import {
  transcribeAudioToText,
  TranscribeAudioToTextInput,
} from "@/ai/flows/transcribe-audio-to-text";

const POLLINATIONS_REFERRER = "PollenBoardStudioApp";

export interface GenerateImageActionResult {
  imageUrl?: string;
  originalPrompt: string;
  finalPrompt: string;
  modelUsed?: string;
  seed?: string;
  error?: string;
}

export async function generateImageAction(
  formData: FormData
): Promise<GenerateImageActionResult> {
  const originalPrompt = formData.get("prompt") as string;
  const model = formData.get("model") as string | undefined;
  const widthStr = formData.get("width") as string | undefined;
  const heightStr = formData.get("height") as string | undefined;
  const seed = formData.get("seed") as string | undefined;
  const enhance = formData.get("enhance") === "true";
  const nologo = formData.get("nologo") === "true"; // Assuming UI provides a checkbox for nologo

  if (!originalPrompt) {
    return {
      error: "Prompt is required.",
      originalPrompt: "",
      finalPrompt: "",
    };
  }

  let finalPrompt = originalPrompt;

  try {
    if (enhance) {
      const enhanceInput: EnhancePromptForBetterImageInput = {
        simplePrompt: originalPrompt,
      };
      const enhancedResult = await enhancePromptForBetterImage(enhanceInput);
      finalPrompt = enhancedResult.enhancedPrompt;
    }

    const imageInput: GenerateImageFromPromptInput = {
      prompt: finalPrompt,
      referrer: POLLINATIONS_REFERRER,
      model: model || undefined,
      width: widthStr ? parseInt(widthStr) : undefined,
      height: heightStr ? parseInt(heightStr) : undefined,
      seed: seed || undefined,
      nologo: true, // Always remove the watermark
    };

    const result = await generateImageFromPrompt(imageInput);
    return {
      imageUrl: result.imageUrl,
      originalPrompt,
      finalPrompt,
      modelUsed: model,
      seed,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating image",
      originalPrompt,
      finalPrompt,
    };
  }
}

export interface GenerateAudioActionResult {
  audioDataUri?: string;
  prompt: string;
  error?: string;
}

export async function generateAudioAction(
  formData: FormData
): Promise<GenerateAudioActionResult> {
  const prompt = formData.get("prompt") as string;
  const voice = formData.get("voice") as string | undefined;

  if (!prompt) {
    return { error: "Prompt is required.", prompt: "" };
  }

  try {
    const audioInput: GenerateAudioFromTextInput = { prompt, voice };
    const result = await generateAudioFromText(audioInput);
    return { audioDataUri: result.audioDataUri, prompt };
  } catch (error) {
    console.error("Error generating audio:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating audio",
      prompt,
    };
  }
}

export interface TranscribeAudioActionResult {
  transcription?: string;
  error?: string;
}

export async function transcribeAudioAction(
  audioDataUri: string,
  audioFormat: string
): Promise<TranscribeAudioActionResult> {
  if (!audioDataUri || !audioFormat) {
    return { error: "Audio data and format are required." };
  }

  try {
    const transcriptionInput: TranscribeAudioToTextInput = {
      audioDataUri,
      audioFormat,
    };
    const result = await transcribeAudioToText(transcriptionInput);
    return { transcription: result.transcription };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error transcribing audio",
    };
  }
}
