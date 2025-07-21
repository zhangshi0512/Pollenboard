"use server";
/**
 * @fileOverview This file defines a flow for generating audio snippets from text prompts using the Pollinations.AI API.
 *
 * - generateAudioFromText - a function that takes a text prompt and returns an audio URL.
 * - GenerateAudioFromTextInput - The input type for the generateAudioFromText function.
 * - GenerateAudioFromTextOutput - The return type for the generateAudioFromText function.
 */

export interface GenerateAudioFromTextInput {
  prompt: string;
  voice?: string;
}

export interface GenerateAudioFromTextOutput {
  audioDataUri: string;
}

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
