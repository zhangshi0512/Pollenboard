// src/app/api/proxy-audio/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return new NextResponse("Audio URL is required", { status: 400 });
  }

  try {
    const response = await fetch(audioUrl, {
      headers: {
        "User-Agent": "PollenBoardStudioApp",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch audio from ${audioUrl}. Status: ${response.status}. Body: ${errorText}`
      );
      return new NextResponse(`Failed to fetch audio: ${response.statusText}`, {
        status: response.status,
      });
    }

    const headers = new Headers();
    // Copy necessary headers from the original response
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    } else {
      headers.set("Content-Type", "audio/mpeg"); // Fallback
    }

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error proxying audio:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
