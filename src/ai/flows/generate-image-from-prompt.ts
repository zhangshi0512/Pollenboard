"use server";
/**
 * @fileOverview Generates an image from a text prompt using the Agnes AI API.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

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
  const model = input.model || "agnes-image-2.1-flash";
  const width = input.width || 1024;
  const height = input.height || 1024;
  const size = `${width}x${height}`;

  try {
    const url = `${AGNES_BASE_URL}/images/generations`;
    const headers = {
      "Authorization": `Bearer ${AGNES_API_KEY}`,
      "Content-Type": "application/json",
    };

    const payload = {
      model,
      prompt: input.prompt,
      size,
      extra_body: {
        response_format: "url",
      },
    };

    console.log("Sending image generation request to Agnes AI:", url, JSON.stringify(payload));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI image generation failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0 || !data.data[0].url) {
      console.error("Invalid response structure from Agnes AI:", data);
      throw new Error("Invalid response from image generation service");
    }

    const imageUrl = data.data[0].url;
    console.log("Successfully generated image via Agnes AI:", imageUrl);

    return {
      imageUrl,
      width,
      height,
      seed: input.seed,
      negative_prompt: input.negative_prompt,
      model,
    };
  } catch (error) {
    console.error("Error in generateImageFromPrompt:", error);
    throw error;
  }
}
