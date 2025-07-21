// src/app/api/proxy-audio/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return new NextResponse("Audio URL is required", { status: 400 });
  }

  try {
    const response = await fetch(audioUrl);

    if (!response.ok) {
      return new NextResponse("Failed to fetch audio", {
        status: response.status,
      });
    }

    const headers = new Headers(response.headers);
    headers.set("Content-Type", "audio/mpeg");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error proxying audio:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
