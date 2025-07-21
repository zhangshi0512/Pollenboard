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

      // Create a clean URL with just the necessary parts
      // This removes all query parameters that might interfere with the transformation
      sourceImageUrl = url.origin + url.pathname;

      console.log("Cleaned pollinations URL:", sourceImageUrl);
    } catch (e) {
      console.error("Error processing URL:", e);
      // Keep the original URL if there's an error
    }
  }

  // For data URLs, we need to handle them differently
  // Data URLs are too long to be passed as query parameters
  if (sourceImageUrl.startsWith("data:")) {
    console.log(
      "Warning: Data URLs may not work properly with the Kontext model"
    );
    // We'll still try to use it, but it might not work
  }

  // Create a simple URL with all parameters inline
  const finalUrl = `${baseUrl}${encodedPrompt}?model=kontext&image=${encodeURIComponent(
    sourceImageUrl
  )}&width=1024&height=1024&nologo=true&logo=false`;

  console.log("Using URL for image transformation:", finalUrl);

  return { imageUrl: finalUrl };
}
