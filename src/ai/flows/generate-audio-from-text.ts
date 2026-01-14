"use server";
/**
 * @fileOverview This file defines a flow for generating audio snippets from text prompts using the Pollinations.AI API.
 *
 * - generateAudioFromText - a function that takes a text prompt and returns an audio URL.
 * - GenerateAudioFromTextInput - The input type for the generateAudioFromText function.
 * - GenerateAudioFromTextOutput - The return type for the generateAudioFromText function.
 */

import { POLLINATIONSAI_API_KEY } from "@/constants";

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
    const encodedText = encodeURIComponent(prompt);
    const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;

    const response = await fetch(audioUrl, {
      headers: {
        "User-Agent": "PollenBoardStudioApp",
        // Add the API key if it's available
        ...(POLLINATIONSAI_API_KEY && {
          Authorization: `Bearer ${POLLINATIONSAI_API_KEY}`,
        }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch audio from ${audioUrl}. Status: ${response.status}. Body: ${errorText}`
      );
      throw new Error(`Failed to generate audio: ${response.statusText}`);
    }

    // Convert the audio to a Base64 data URI
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;

    return { audioDataUri };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
}
