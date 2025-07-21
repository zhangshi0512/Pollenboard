"use server";
/**
 * @fileOverview Generates an image from an existing image using the Pollinations.AI Kontext model.
 *
 * - generateImageFromImage - A function that handles the image-to-image generation process.
 * - GenerateImageFromImageInput - The input type for the generateImageFromImage function.
 * - GenerateImageFromImageOutput - The return type for the generateImageFromImage function.
 */

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
  // For Kontext model, we need to use a specific format
  const baseUrl = "https://image.pollinations.ai/prompt/";
  const encodedPrompt = encodeURIComponent(input.prompt);
  const sourceImageUrl = input.imageUrl;

  // Create a simple URL with all parameters inline
  const finalUrl = `${baseUrl}${encodedPrompt}?model=kontext&image=${encodeURIComponent(
    sourceImageUrl
  )}&width=1024&height=1024&nologo=true&logo=false`;

  console.log("Using URL for image transformation:", finalUrl);

  return { imageUrl: finalUrl, width: 1024, height: 1024 };
}
