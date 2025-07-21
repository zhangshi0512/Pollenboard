"use server";
/**
 * @fileOverview A flow that transcribes audio to text using the Pollinations.AI API.
 *
 * - transcribeAudioToText - A function that handles the audio transcription process.
 * - TranscribeAudioToTextInput - The input type for the transcribeAudioToText function.
 * - TranscribeAudioToTextOutput - The return type for the transcribeAudioToText function.
 */

export interface TranscribeAudioToTextInput {
  audioDataUri: string;
  audioFormat: string; // e.g., 'wav', 'mp3'
}

export interface TranscribeAudioToTextOutput {
  transcription: string;
}

export async function transcribeAudioToText(
  input: TranscribeAudioToTextInput
): Promise<TranscribeAudioToTextOutput> {
  try {
    console.log(
      `Starting transcription for audio format: ${input.audioFormat}`
    );

    // Convert data URI to a Blob
    const fetchResponse = await fetch(input.audioDataUri);
    const blob = await fetchResponse.blob();

    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append("file", blob, `audio.${input.audioFormat}`);
    formData.append("model", "openai-audio");

    const response = await fetch(
      "https://text.pollinations.ai/transcriptions",
      {
        method: "POST",
        body: formData,
        // Note: Don't set Content-Type header when using FormData with fetch,
        // the browser will automatically set it with the correct boundary.
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Transcription API failed with status: ${response.status}`,
        errorBody
      );
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.text) {
      console.error('Transcription result is missing the "text" field', result);
      throw new Error("Invalid transcription response from API.");
    }

    return { transcription: result.text };
  } catch (error) {
    console.error("Error during transcription:", error);
    throw new Error("Failed to transcribe audio. Please try again later.");
  }
}
