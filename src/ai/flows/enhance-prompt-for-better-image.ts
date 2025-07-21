"use server";
/**
 * @fileOverview Enhances a user-provided text prompt using Pollinations.ai to generate a more detailed prompt for image generation.
 *
 * - enhancePromptForBetterImage - A function that accepts a simple prompt and returns an enhanced prompt.
 * - EnhancePromptForBetterImageInput - The input type for the enhancePromptForBetterImage function.
 * - EnhancePromptForBetterImageOutput - The return type for the enhancePromptForBetterImage function.
 */

export interface EnhancePromptForBetterImageInput {
  simplePrompt: string;
}

export interface EnhancePromptForBetterImageOutput {
  enhancedPrompt: string;
}

/**
 * Enhances a simple prompt to create a more detailed and compelling prompt for image generation
 * using Pollinations.ai's text generation service.
 *
 * @param input The input containing the simple prompt to enhance
 * @returns An object containing the enhanced prompt
 */
export async function enhancePromptForBetterImage(
  input: EnhancePromptForBetterImageInput
): Promise<EnhancePromptForBetterImageOutput> {
  try {
    // Create a prompt for the Pollinations.ai service
    const promptForEnhancement = `You are an expert prompt engineer. Your job is to take a simple prompt from the user and expand it to create a more detailed and compelling prompt that will generate a better image. Simple Prompt: ${input.simplePrompt}\n\nEnhanced Prompt:`;

    // Encode the prompt for URL usage
    const encodedPrompt = encodeURIComponent(promptForEnhancement);

    // Construct the URL for the Pollinations.ai text generation service
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}`;

    console.log("Sending prompt enhancement request to Pollinations.ai");

    // Make the request to the Pollinations.ai text API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "User-Agent": "PollenBoardStudioApp",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Prompt enhancement failed with status: ${response.status}`
      );
    }

    // Get the enhanced prompt from the response
    const enhancedPrompt = await response.text();

    return { enhancedPrompt };
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt. Please try again later.");
  }
}
