"use server";
/**
 * @fileOverview This file defines a Genkit flow for generating audio snippets from text prompts using the Pollinations.AI API.
 *
 * - generateAudioFromText - A function that takes a text prompt and generates an audio snippet.
 * - GenerateAudioFromTextInput - The input type for the generateAudioFromText function.
 * - GenerateAudioFromTextOutput - The return type for the generateAudioFromText function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateAudioFromTextInputSchema = z.object({
  prompt: z.string().describe("The text prompt to generate audio from."),
  voice: z
    .string()
    .optional()
    .describe("The voice to use for the audio generation. Defaults to alloy."),
});
export type GenerateAudioFromTextInput = z.infer<
  typeof GenerateAudioFromTextInputSchema
>;

const GenerateAudioFromTextOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio data as a data URI."),
});
export type GenerateAudioFromTextOutput = z.infer<
  typeof GenerateAudioFromTextOutputSchema
>;

export async function generateAudioFromText(
  input: GenerateAudioFromTextInput
): Promise<GenerateAudioFromTextOutput> {
  const { prompt, voice = "alloy" } = input;

  try {
    // Use the Pollinations.AI text-to-speech API directly
    const encodedText = encodeURIComponent(prompt);
    const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;

    // Instead of trying to convert to a blob URL (which doesn't work on the server),
    // we'll just return the direct Pollinations.AI URL
    return { audioDataUri: audioUrl };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
}
