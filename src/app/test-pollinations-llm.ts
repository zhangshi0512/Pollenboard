"use server";

import { generateTextFromPrompt } from "@/ai/flows/generate-text-from-prompt";

export async function testPollinationsLLM() {
  try {
    console.log("Testing Pollinations.ai LLM service...");

    const result = await generateTextFromPrompt({
      prompt: "Why is the sky blue?",
      referrer: "PollenBoardTest",
    });

    console.log("Response from Pollinations.ai:", result.generatedText);
    return result.generatedText;
  } catch (error) {
    console.error("Error testing Pollinations.ai LLM:", error);
    throw error;
  }
}
