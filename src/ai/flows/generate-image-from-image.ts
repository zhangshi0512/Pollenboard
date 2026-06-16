"use server";
/**
 * @fileOverview Generates an image from an existing image using the Agnes AI API.
 *
 * - generateImageFromImage - A function that handles the image-to-image generation process.
 * - GenerateImageFromImageInput - The input type for the generateImageFromImage function.
 * - GenerateImageFromImageOutput - The return type for the generateImageFromImage function.
 */

import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

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

export async function generateImageFromImage(
  input: GenerateImageFromImageInput
): Promise<GenerateImageFromImageOutput> {
  const model = "agnes-image-2.1-flash";
  const size = "1024x1024";

  // Process the input image URL
  let sourceImageUrl = input.imageUrl;

  // If the URL is from pollinations.ai and contains query parameters, clean it up
  if (
    sourceImageUrl.includes("image.pollinations.ai") &&
    sourceImageUrl.includes("?")
  ) {
    try {
      // Extract just the base URL without query parameters
      const url = new URL(sourceImageUrl);
      sourceImageUrl = url.origin + url.pathname;
    } catch (e) {
      console.error("Error processing URL:", e);
    }
  }

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
        image: [sourceImageUrl],
        response_format: "url",
      },
    };

    console.log("Sending image-to-image request to Agnes AI:", url, JSON.stringify(payload));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI image-to-image failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Failed to generate image from image: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0 || !data.data[0].url) {
      console.error("Invalid response structure from Agnes AI:", data);
      throw new Error("Invalid response from image-to-image generation service");
    }

    const imageUrl = data.data[0].url;
    console.log("Successfully generated image-to-image via Agnes AI:", imageUrl);

    return { imageUrl, width: 1024, height: 1024 };
  } catch (error) {
    console.error("Error in generateImageFromImage:", error);
    throw error;
  }
}
