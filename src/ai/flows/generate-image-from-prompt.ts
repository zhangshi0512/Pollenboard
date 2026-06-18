"use server";
/**
 * @fileOverview Generates an image from a text prompt using the Agnes AI API.
 */

import { agnesPost } from "@/lib/agnes";

export interface GenerateImageFromPromptInput {
  prompt: string;
  referrer?: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: string;
  nologo?: boolean;
  negative_prompt?: string;
}

export interface GenerateImageFromPromptOutput {
  imageUrl: string;
  width?: number;
  height?: number;
  seed?: string;
  negative_prompt?: string;
  model?: string;
}

interface AgnesImageResponse {
  data?: Array<{ url?: string | null; b64_json?: string | null }>;
}

const SUPPORTED_SIZES = new Set([
  "1024x1024",
  "1024x768",
  "768x1024",
]);

function normalizeSize(width: number, height: number): string {
  const size = `${width}x${height}`;
  if (SUPPORTED_SIZES.has(size)) {
    return size;
  }

  const ratio = width / height;
  if (ratio > 1.1) return "1024x768";
  if (ratio < 0.9) return "768x1024";
  return "1024x1024";
}

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  const prompt = input.prompt?.trim();
  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }

  const model = input.model || "agnes-image-2.1-flash";
  const width = input.width || 1024;
  const height = input.height || 1024;
  const size = normalizeSize(width, height);

  const payload = {
    model,
    prompt,
    size,
  };

  console.log("Sending image generation request to Agnes AI:", payload);

  const data = await agnesPost<AgnesImageResponse>(
    "/images/generations",
    payload
  );

  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error("Invalid response structure from Agnes AI:", data);
    throw new Error("Agnes API returned no image URL.");
  }

  console.log("Successfully generated image via Agnes AI:", imageUrl);

  const [normalizedWidth, normalizedHeight] = size.split("x").map(Number);

  return {
    imageUrl,
    width: normalizedWidth,
    height: normalizedHeight,
    seed: input.seed,
    negative_prompt: input.negative_prompt,
    model,
  };
}
