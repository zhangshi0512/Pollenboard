'use server';
/**
 * @fileOverview Generates an image from a text prompt using the Pollinations.AI API.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
  referrer: z.string().optional().describe('The referrer URL/Identifier for the request.'),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type GenerateImageFromPromptOutput = z.infer<typeof GenerateImageFromPromptOutputSchema>;

export async function generateImageFromPrompt(input: GenerateImageFromPromptInput): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateImagePrompt = ai.definePrompt({
  name: 'generateImagePrompt',
  input: {schema: GenerateImageFromPromptInputSchema},
  output: {schema: GenerateImageFromPromptOutputSchema},
  prompt: `Generate an image URL from the following prompt using the Pollinations.AI API:

Prompt: {{{prompt}}}

{{#if referrer}}
Referrer: {{{referrer}}}
{{/if}}

Ensure the URL is a direct link to the generated image.

Respond with the image URL.`,
});

const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async input => {
    const baseUrl = 'https://image.pollinations.ai/prompt/';
    const encodedPrompt = encodeURIComponent(input.prompt);
    let url = `${baseUrl}${encodedPrompt}`;

    if (input.referrer) {
      url += `?referrer=${encodeURIComponent(input.referrer)}`;
    }
    
    return {imageUrl: url};
  }
);
