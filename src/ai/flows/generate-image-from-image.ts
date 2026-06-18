"use server";
/**
 * @fileOverview Generates an image from an existing image using the Agnes AI API.
 */

import { agnesPost } from "@/lib/agnes";

export interface GenerateImageFromImageInput {
  prompt: string;
  imageUrl: string;
  referrer?: string;
  nologo?: boolean;
}

export interface GenerateImageFromImageOutput {
  imageUrl: string;
  width: number;
  height: number;
}

interface AgnesImageResponse {
  data?: Array<{ url?: string | null; b64_json?: string | null }>;
}

export async function generateImageFromImage(
  input: GenerateImageFromImageInput
): Promise<GenerateImageFromImageOutput> {
  const prompt = input.prompt?.trim();
  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }

  const model = "agnes-image-2.1-flash";
  const size = "1024x1024";

  let sourceImageUrl = input.imageUrl;

  if (
    sourceImageUrl.includes("image.pollinations.ai") &&
    sourceImageUrl.includes("?")
  ) {
    try {
      const url = new URL(sourceImageUrl);
      sourceImageUrl = url.origin + url.pathname;
    } catch (e) {
      console.error("Error processing URL:", e);
    }
  }

  const payload: Record<string, unknown> = {
    model,
    prompt,
    size,
    image: [sourceImageUrl],
  };

  console.log("Sending image-to-image request to Agnes AI");

  const data = await agnesPost<AgnesImageResponse>(
    "/images/generations",
    payload
  );

  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error("Invalid response structure from Agnes AI:", data);
    throw new Error("Agnes API returned no image URL.");
  }

  console.log("Successfully generated image-to-image via Agnes AI:", imageUrl);

  return { imageUrl, width: 1024, height: 1024 };
}
