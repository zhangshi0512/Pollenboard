"use server";
/**
 * @fileOverview Generates an image from a text prompt using the Pollinations.AI API.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 *
 * Updated to use the new gen.pollinations.ai API v0.3.0 with API key authentication.
 * See: https://pollinations.ai API docs
 */

import { POLLINATIONSAI_API_KEY } from "@/constants";

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

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  // Use the new gen.pollinations.ai API endpoint (v0.3.0)
  const baseUrl = "https://gen.pollinations.ai/image/";
  const encodedPrompt = encodeURIComponent(input.prompt);
  let url = `${baseUrl}${encodedPrompt}`;

  // Build query parameters
  const queryParams = new URLSearchParams();

  // Add API key authentication via query parameter
  if (POLLINATIONSAI_API_KEY) {
    queryParams.set("key", POLLINATIONSAI_API_KEY);
  }

  if (input.referrer) {
    queryParams.set("referrer", input.referrer);
  }

  if (input.model) {
    queryParams.set("model", input.model);
  }

  if (input.width) {
    queryParams.set("width", input.width.toString());
  }

  if (input.height) {
    queryParams.set("height", input.height.toString());
  }

  if (input.seed) {
    queryParams.set("seed", input.seed);
  }

  if (input.negative_prompt) {
    queryParams.set("negative_prompt", input.negative_prompt);
  }

  // Always set nologo to true to remove watermark
  queryParams.set("nologo", "true");

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return {
    imageUrl: url,
    width: input.width,
    height: input.height,
    seed: input.seed,
    negative_prompt: input.negative_prompt,
    model: input.model,
  };
}
