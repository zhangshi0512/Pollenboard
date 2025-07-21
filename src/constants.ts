// src/constants.ts

// It's important to keep the API key secret and only access it on the server.
// We are using `process.env` to access the key, which is only available on the server.
export const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
