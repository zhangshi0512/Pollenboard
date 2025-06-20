import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-from-prompt.ts';
import '@/ai/flows/enhance-prompt-for-better-image.ts';
import '@/ai/flows/generate-audio-from-text.ts';
import '@/ai/flows/transcribe-audio-to-text.ts';