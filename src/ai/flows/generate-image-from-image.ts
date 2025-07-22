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
      // Keep the original URL if there's an error
    }
  }

  // Create a simple URL with all parameters inline
  const finalUrl = `${baseUrl}${encodedPrompt}?model=kontext&image=${encodeURIComponent(
    sourceImageUrl
  )}&nologo=${input.nologo}&referrer=${input.referrer}`;

  console.log("Using URL for image transformation:", finalUrl);

  return { imageUrl: finalUrl, width: 1024, height: 1024 };
}
