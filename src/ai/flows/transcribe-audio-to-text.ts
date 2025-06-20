'use server';
/**
 * @fileOverview A flow that transcribes audio to text using the Pollinations.AI API.
 *
 * - transcribeAudioToText - A function that handles the audio transcription process.
 * - TranscribeAudioToTextInput - The input type for the transcribeAudioToText function.
 * - TranscribeAudioToTextOutput - The return type for the transcribeAudioToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording of speech as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  audioFormat: z.string().describe('The audio format of the recording (e.g., wav, mp3).'),
});
export type TranscribeAudioToTextInput = z.infer<typeof TranscribeAudioToTextInputSchema>;

const TranscribeAudioToTextOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio recording.'),
});
export type TranscribeAudioToTextOutput = z.infer<typeof TranscribeAudioToTextOutputSchema>;

export async function transcribeAudioToText(input: TranscribeAudioToTextInput): Promise<TranscribeAudioToTextOutput> {
  return transcribeAudioToTextFlow(input);
}

const transcribeAudioToTextPrompt = ai.definePrompt({
  name: 'transcribeAudioToTextPrompt',
  input: {schema: TranscribeAudioToTextInputSchema},
  output: {schema: TranscribeAudioToTextOutputSchema},
  prompt: `Transcribe the following audio recording to text.\n\nAudio: {{media url=audioDataUri format=audioFormat}}`,
});

const transcribeAudioToTextFlow = ai.defineFlow(
  {
    name: 'transcribeAudioToTextFlow',
    inputSchema: TranscribeAudioToTextInputSchema,
    outputSchema: TranscribeAudioToTextOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioToTextPrompt(input);
    return output!;
  }
);
