"use server";
/**
 * @fileOverview Generates an image from a text prompt using the Pollinations.AI API.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

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
}

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  const baseUrl = "https://image.pollinations.ai/prompt/";
  const encodedPrompt = encodeURIComponent(input.prompt);
  let url = `${baseUrl}${encodedPrompt}`;

  // Build query parameters
  const queryParams = new URLSearchParams();

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

  return { imageUrl: url };
}
