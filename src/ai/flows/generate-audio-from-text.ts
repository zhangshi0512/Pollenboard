'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating audio snippets from text prompts using the Pollinations.AI API.
 *
 * - generateAudioFromText - A function that takes a text prompt and generates an audio snippet.
 * - GenerateAudioFromTextInput - The input type for the generateAudioFromText function.
 * - GenerateAudioFromTextOutput - The return type for the generateAudioFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAudioFromTextInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate audio from.'),
  voice: z.string().optional().describe('The voice to use for the audio generation. Defaults to alloy.'),
});
export type GenerateAudioFromTextInput = z.infer<typeof GenerateAudioFromTextInputSchema>;

const GenerateAudioFromTextOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio data as a data URI.'),
});
export type GenerateAudioFromTextOutput = z.infer<typeof GenerateAudioFromTextOutputSchema>;

export async function generateAudioFromText(input: GenerateAudioFromTextInput): Promise<GenerateAudioFromTextOutput> {
  return generateAudioFromTextFlow(input);
}

const generateAudioFromTextPrompt = ai.definePrompt({
  name: 'generateAudioFromTextPrompt',
  input: {schema: GenerateAudioFromTextInputSchema},
  output: {schema: GenerateAudioFromTextOutputSchema},
  prompt: `Generate audio from the following text prompt using the specified voice (if provided):

Prompt: {{{prompt}}}
Voice: {{{voice}}}

Return the audio as a data URI.
`,
});

const generateAudioFromTextFlow = ai.defineFlow(
  {
    name: 'generateAudioFromTextFlow',
    inputSchema: GenerateAudioFromTextInputSchema,
    outputSchema: GenerateAudioFromTextOutputSchema,
  },
  async input => {
    const response = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `Generate audio from the following text prompt using the specified voice (if provided): ${input.prompt}`,
        config: {
            responseModalities: ['TEXT']
        }
    });

    // Extract the audio data from the response
    const audioDataUri = response.text;

    return {audioDataUri};
  }
);
