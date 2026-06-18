import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

export function getAgnesApiKey(): string {
  const key = (AGNES_API_KEY || "").trim();
  if (!key) {
    throw new Error(
      "AGNES_API_KEY is not configured. Add it in Vercel Environment Variables."
    );
  }
  return key;
}

export function parseAgnesError(status: number, errorText: string): string {
  try {
    const data = JSON.parse(errorText);
    const message =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      errorText;
    return `Agnes API error (${status}): ${message}`;
  } catch {
    return `Agnes API error (${status}): ${errorText || "Unknown error"}`;
  }
}

export async function agnesPost<T>(
  path: string,
  payload: Record<string, unknown>,
  timeoutMs = 120000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${AGNES_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAgnesApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes API POST ${path} failed:`, response.status, errorText);
      throw new Error(parseAgnesError(response.status, errorText));
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Image generation timed out. Please try again with a simpler prompt."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
