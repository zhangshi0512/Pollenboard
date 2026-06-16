// src/constants.ts

// It's important to keep the API key secret and only access it on the server.
// We are using `process.env` to access the key, which is only available on the server.
export const POLLINATIONSAI_API_KEY = process.env.POLLINATIONSAI_API_KEY;

export const AGNES_API_KEY = process.env.AGNES_API_KEY || "sk-igVJkJa5lEkb9glOk11EEusoOOs4iK4f2r4QNyDKYuAvtzMK";
export const AGNES_BASE_URL = "https://apihub.agnes-ai.com/v1";

