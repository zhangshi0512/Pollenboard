'use server';
/**
 * @fileOverview Enhances a user-provided text prompt using an LLM to generate a more detailed prompt for image generation.
 *
 * - enhancePromptForBetterImage - A function that accepts a simple prompt and returns an enhanced prompt.
 * - EnhancePromptForBetterImageInput - The input type for the enhancePromptForBetterImage function.
 * - EnhancePromptForBetterImageOutput - The return type for the enhancePromptForBetterImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptForBetterImageInputSchema = z.object({
  simplePrompt: z
    .string()
    .describe('A simple text prompt to be enhanced for better image generation.'),
});
export type EnhancePromptForBetterImageInput = z.infer<typeof EnhancePromptForBetterImageInputSchema>;

const EnhancePromptForBetterImageOutputSchema = z.object({
  enhancedPrompt: z
    .string()
    .describe('An enhanced text prompt that will generate a better image than the simple prompt.'),
});
export type EnhancePromptForBetterImageOutput = z.infer<typeof EnhancePromptForBetterImageOutputSchema>;

export async function enhancePromptForBetterImage(
  input: EnhancePromptForBetterImageInput
): Promise<EnhancePromptForBetterImageOutput> {
  return enhancePromptForBetterImageFlow(input);
}

const enhancePromptForBetterImagePrompt = ai.definePrompt({
  name: 'enhancePromptForBetterImagePrompt',
  input: {schema: EnhancePromptForBetterImageInputSchema},
  output: {schema: EnhancePromptForBetterImageOutputSchema},
  prompt: `You are an expert prompt engineer. Your job is to take a simple prompt from the user and expand it to create a more detailed and compelling prompt that will generate a better image.

Simple Prompt: {{{simplePrompt}}}

Enhanced Prompt:`,
});

const enhancePromptForBetterImageFlow = ai.defineFlow(
  {
    name: 'enhancePromptForBetterImageFlow',
    inputSchema: EnhancePromptForBetterImageInputSchema,
    outputSchema: EnhancePromptForBetterImageOutputSchema,
  },
  async input => {
    const {output} = await enhancePromptForBetterImagePrompt(input);
    return output!;
  }
);
