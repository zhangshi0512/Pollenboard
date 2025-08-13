import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const upstream = await fetch(url, {
      headers: { Accept: "audio/mpeg, audio/*;q=0.9,*/*;q=0.8" },
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    const arrayBuffer = await upstream.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
