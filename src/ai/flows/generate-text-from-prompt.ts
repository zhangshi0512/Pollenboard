"use server";
/**
 * @fileOverview Generates text using the Agnes AI chat completion service.
 *
 * - generateTextFromPrompt - A function that handles the text generation process.
 * - GenerateTextFromPromptInput - The input type for the generateTextFromPrompt function.
 * - GenerateTextFromPromptOutput - The return type for the generateTextFromPrompt function.
 */

import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

export interface GenerateTextFromPromptInput {
  prompt: string;
  referrer?: string;
}

export interface GenerateTextFromPromptOutput {
  generatedText: string;
}

/**
 * Generates text using the Agnes AI chat completion service.
 *
 * @param input The input parameters for text generation
 * @returns The generated text
 */
export async function generateTextFromPrompt(
  input: GenerateTextFromPromptInput
): Promise<GenerateTextFromPromptOutput> {
  try {
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
          content: input.prompt,
        },
      ],
    };

    console.log("Sending text generation request to Agnes AI:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI text generation failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Text generation failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      console.error("Invalid response structure from Agnes AI:", data);
      throw new Error("Invalid response from text generation service");
    }

    const generatedText = data.choices[0].message.content;

    return { generatedText };
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error generating text"
    );
  }
}
