"use server";
/**
 * @fileOverview Generates text using the Pollinations.AI text generation service.
 *
 * - generateTextFromPrompt - A function that handles the text generation process.
 * - GenerateTextFromPromptInput - The input type for the generateTextFromPrompt function.
 * - GenerateTextFromPromptOutput - The return type for the generateTextFromPrompt function.
 */

export interface GenerateTextFromPromptInput {
  prompt: string;
  referrer?: string;
}

export interface GenerateTextFromPromptOutput {
  generatedText: string;
}

/**
 * Generates text using the Pollinations.ai text generation service.
 *
 * @param input The input parameters for text generation
 * @returns The generated text
 */
export async function generateTextFromPrompt(
  input: GenerateTextFromPromptInput
): Promise<GenerateTextFromPromptOutput> {
  try {
    // Encode the prompt for URL usage
    const encodedPrompt = encodeURIComponent(input.prompt);

    // Construct the URL for the Pollinations.ai text generation service
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}`;

    console.log("Sending text generation request to:", apiUrl);

    // Make the request to the Pollinations.ai text API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain",
        "User-Agent": input.referrer || "PollenBoardStudioApp",
      },
    });

    if (!response.ok) {
      throw new Error(`Text generation failed with status: ${response.status}`);
    }

    // Get the generated text from the response
    const generatedText = await response.text();

    return { generatedText };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error generating text"
    );
  }
}
