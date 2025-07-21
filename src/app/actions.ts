"use server";

import {
  generateImageFromPrompt,
  GenerateImageFromPromptInput,
} from "@/ai/flows/generate-image-from-prompt";
import {
  generateImageFromImage,
  GenerateImageFromImageInput,
} from "@/ai/flows/generate-image-from-image";
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
import {
  generateTextFromPrompt,
  GenerateTextFromPromptInput,
} from "@/ai/flows/generate-text-from-prompt";

const POLLINATIONS_REFERRER = "PollenBoardStudioApp";

export interface GenerateImageActionResult {
  imageUrl?: string;
  originalPrompt: string;
  finalPrompt: string;
  modelUsed?: string;
  seed?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
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
  const negativePrompt = formData.get("negative_prompt") as string | undefined;

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
      negative_prompt: negativePrompt || undefined,
    };

    const result = await generateImageFromPrompt(imageInput);
    return {
      imageUrl: result.imageUrl,
      originalPrompt,
      finalPrompt,
      modelUsed: result.model,
      seed: result.seed,
      width: result.width,
      height: result.height,
      negativePrompt: result.negative_prompt,
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

    // We get back a data URI, so we can pass it directly to the client
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

export interface GenerateImageFromImageActionResult {
  imageUrl?: string;
  originalPrompt: string;
  sourceImageUrl: string;
  width?: number;
  height?: number;
  error?: string;
}

export interface GenerateTextActionResult {
  generatedText?: string;
  prompt: string;
  error?: string;
}

export async function generateTextAction(
  formData: FormData
): Promise<GenerateTextActionResult> {
  const prompt = formData.get("prompt") as string;

  if (!prompt) {
    return { error: "Prompt is required.", prompt: "" };
  }

  try {
    const textInput: GenerateTextFromPromptInput = {
      prompt,
      referrer: POLLINATIONS_REFERRER,
    };

    const result = await generateTextFromPrompt(textInput);
    return { generatedText: result.generatedText, prompt };
  } catch (error) {
    console.error("Error generating text:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating text",
      prompt,
    };
  }
}

export async function generateImageFromImageAction(
  formData: FormData
): Promise<GenerateImageFromImageActionResult> {
  const prompt = formData.get("prompt") as string;
  const sourceImageUrl = formData.get("sourceImageUrl") as string;

  console.log("Image-to-Image Action - Prompt:", prompt);
  console.log(
    "Image-to-Image Action - Source URL length:",
    sourceImageUrl?.length || 0
  );

  // Check if it's a data URL (for uploaded files)
  const isDataUrl = sourceImageUrl?.startsWith("data:");
  console.log("Image-to-Image Action - Is data URL:", isDataUrl);

  if (!prompt) {
    console.log("Image-to-Image Action - Error: Prompt is required");
    return {
      error: "Prompt is required.",
      originalPrompt: "",
      sourceImageUrl: sourceImageUrl || "",
    };
  }

  if (!sourceImageUrl) {
    console.log("Image-to-Image Action - Error: Source image URL is required");
    return {
      error: "Source image URL is required.",
      originalPrompt: prompt,
      sourceImageUrl: "",
    };
  }

  try {
    const imageInput: GenerateImageFromImageInput = {
      prompt,
      imageUrl: sourceImageUrl,
      referrer: POLLINATIONS_REFERRER,
      nologo: true, // Always remove the watermark
    };

    console.log("Image-to-Image Action - Sending request with:", {
      prompt,
      imageUrl:
        sourceImageUrl.substring(0, 100) +
        (sourceImageUrl.length > 100 ? "..." : ""),
    });

    const result = await generateImageFromImage(imageInput);
    console.log("Image-to-Image Action - Result URL:", result.imageUrl);

    return {
      imageUrl: result.imageUrl,
      originalPrompt: prompt,
      sourceImageUrl: sourceImageUrl,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Error generating image from image:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating image from image",
      originalPrompt: prompt,
      sourceImageUrl,
    };
  }
}
