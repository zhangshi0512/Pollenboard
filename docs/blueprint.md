# **App Name**: PollenBoard

## Core Features:

- Dynamic Pin Grid: Displays image 'pins' in a Pinterest-like layout, responsively adapting to different screen sizes. Implemented in Nextjs.
- AI Image Generation: Allows users to input a text prompt and generate an image using the Pollinations.AI API. Users will register an identifier and include it as a 'referrer'.
- Image Pin Integration: Presents the generated image alongside the prompt in the pin grid. Provides options to adjust image size and layout.
- AI Audio Generation: Enables users to create audio snippets from text prompts using the Pollinations.AI API, then attach those to the image in the pins.
- Speech-to-text functionality: Allows users to use their microphone, and leverages AI models from Pollinations.AI as a tool for Speech-to-Text transcription
- Basic Image Editing: Offers simple editing tools like cropping and rotating the AI generated image before submitting to the feed.
- Dynamic Model List: Allows the AI models to be listed dynamically so as new ones come online on the Pollinations.AI service, this board has access to them too.

## Style Guidelines:

- Primary color: Saturated teal (#33A19F), suggestive of both sky and sea, to lend a creative-but-calming tone. 
- Background color: Pale off-white (#F2F4F3) to create a clean, neutral backdrop that allows the generated content to stand out.
- Accent color: Deep salmon (#E37A71) as a complementary hue for call-to-action elements like buttons.
- Body and headline font: 'Inter', a sans-serif font known for its readability and modern appearance.
- A set of minimalist, geometric icons will represent actions and categories. To maintain simplicity, icons will be line-based, rather than filled, in a 24x24 grid.
- The pin layout will resemble Pinterest, featuring images in a masonry grid. Expect a multi-column, variable height grid to adapt to the various images created by the user.
- Subtle animations will be applied, such as a fade-in effect as the AI image renders.