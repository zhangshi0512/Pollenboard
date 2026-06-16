"use server";
/**
 * @fileOverview Enhances a user-provided text prompt using Agnes AI to generate a more detailed prompt for image generation.
 *
 * - enhancePromptForBetterImage - A function that accepts a simple prompt and returns an enhanced prompt.
 * - EnhancePromptForBetterImageInput - The input type for the enhancePromptForBetterImage function.
 * - EnhancePromptForBetterImageOutput - The return type for the enhancePromptForBetterImage function.
 */

import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

export interface EnhancePromptForBetterImageInput {
  simplePrompt: string;
}

export interface EnhancePromptForBetterImageOutput {
  enhancedPrompt: string;
}

/**
 * Enhances a simple prompt to create a more detailed and compelling prompt for image generation
 * using Agnes AI's chat completion service.
 *
 * @param input The input containing the simple prompt to enhance
 * @returns An object containing the enhanced prompt
 */
export async function enhancePromptForBetterImage(
  input: EnhancePromptForBetterImageInput
): Promise<EnhancePromptForBetterImageOutput> {
  try {
    const promptForEnhancement = `You are an expert prompt engineer. Your job is to take a simple prompt from the user and expand it to create a more detailed and compelling prompt that will generate a better image. Only output the enhanced prompt, do not include any other text, markdown, or conversational fluff. Simple Prompt: ${input.simplePrompt}\n\nEnhanced Prompt:`;

    const url = `${AGNES_BASE_URL}/chat/completions`;
    const headers = {
      "Authorization": `Bearer ${AGNES_API_KEY}`,
      "Content-Type": "application/json",
    };

    const payload = {
      model: "agnes-2.0-flash",
      messages: [
        {
          role: "user",
          content: promptForEnhancement,
        },
      ],
    };

    console.log("Sending prompt enhancement request to Agnes AI");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI prompt enhancement failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(
        `Prompt enhancement failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      console.error("Invalid response structure from Agnes AI:", data);
      throw new Error("Invalid response from prompt enhancement service");
    }

    const enhancedPrompt = data.choices[0].message.content;

    return { enhancedPrompt: enhancedPrompt.trim() };
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt. Please try again later.");
  }
}
