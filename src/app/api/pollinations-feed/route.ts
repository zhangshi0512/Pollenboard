import { NextResponse } from "next/server";

export interface PollinationsFeedItem {
  width: number;
  height: number;
  seed: number;
  model: string;
  enhance: boolean;
  nologo: boolean;
  negative_prompt: string;
  nofeed: boolean;
  safe: boolean;
  quality: string;
  image: any[];
  transparent: boolean;
  concurrentRequests: number;
  imageURL: string;
  thumbnailURL?: string; // Added for optimized loading
  prompt: string;
  isChild: boolean;
  isMature: boolean;
  maturity: {
    isChild: boolean;
  };
  timingInfo: Array<{
    step: string;
    timestamp: number;
  }>;
  status: string;
  wasPimped: boolean;
  nsfw: boolean;
  private: boolean;
  token: string | null;
}

// Generate fresh mock data each time, especially on refresh
const generateMockFeedItems = (
  count: number,
  baseOffset: number = 0,
  refresh: boolean = false
) => {
  // Two sets of themes to ensure visibly different results on refresh
  const themesSet1 = [
    "A majestic mountain range at sunset",
    "A futuristic space station orbiting Earth",
    "An enchanted forest with magical creatures",
    "A cyberpunk cityscape at night",
    "A serene beach with crystal clear water",
    "A medieval castle on a hilltop",
    "An underwater scene with coral reefs",
    "A desert landscape with unique rock formations",
    "A bustling market in an ancient city",
    "A cozy cabin in a snowy forest",
    "A beautiful sunset over mountains with vibrant colors",
    "A futuristic city with flying cars and neon lights",
    "A magical forest with glowing plants and fantasy creatures",
    "An astronaut riding a horse on Mars",
    "A steampunk airship flying through clouds",
  ];

  const themesSet2 = [
    "An underwater city with bioluminescent architecture",
    "A fantasy castle on a floating island",
    "A Japanese garden in autumn with maple trees",
    "A colorful hot air balloon festival",
    "A dragon soaring over ancient ruins",
    "A space explorer discovering alien landscapes",
    "A Victorian mansion in a thunderstorm",
    "A tropical paradise with waterfalls",
    "A robot city in the distant future",
    "A mystical portal in an ancient temple",
    "A pirate ship sailing through stormy seas",
    "A crystal cave with glowing formations",
    "A floating market in Venice at dawn",
    "A samurai warrior in cherry blossom season",
    "A lighthouse on a rocky cliff during sunset",
  ];

  // Use different theme sets based on refresh flag
  const themes = refresh ? themesSet2 : themesSet1;

  const modelTypes = ["flux", "turbo", "playground"];
  const qualities = ["high", "medium"];
  const negativePrompts = [
    "worst quality, blurry, distorted, low resolution",
    "ugly, deformed, disfigured, poor details",
    "text, watermark, signature, username",
    "extra limbs, extra fingers, mutated hands",
    "bad anatomy, bad proportions, error",
    "cloned face, duplicate, morbid, mutilated",
    "out of frame, body out of frame, dehydrated",
    "jpeg artifacts, noisy, unclear, undefined",
  ];
  const dimensions = [
    { width: 1080, height: 1080 },
    { width: 1080, height: 1920 },
    { width: 1200, height: 800 },
    { width: 800, height: 1200 },
    { width: 1024, height: 1024 },
    { width: 1600, height: 900 },
    { width: 1080, height: 1350 },
    { width: 1200, height: 1200 },
    { width: 1024, height: 1536 },
  ];

  const items: PollinationsFeedItem[] = [];

  // Use timestamp and refresh flag to create different seeds
  const timestamp = Date.now();
  const refreshOffset = refresh ? Math.floor(timestamp / 1000) : 0;

  for (let i = 0; i < count; i++) {
    const themeIndex = (i + baseOffset + refreshOffset) % themes.length;
    const theme = themes[themeIndex];
    const model = modelTypes[Math.floor(Math.random() * modelTypes.length)];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    const negativePrompt =
      negativePrompts[Math.floor(Math.random() * negativePrompts.length)];
    const dimension = dimensions[Math.floor(Math.random() * dimensions.length)];
    const seed =
      baseOffset + i + refreshOffset + Math.floor(Math.random() * 10000);

    const fullPrompt = `${theme}, detailed artwork, high quality, professional photography, trending on artstation`;
    // Calculate thumbnail dimensions while maintaining aspect ratio
    const maxThumbnailWidth = 400; // Smaller thumbnail for faster loading
    const maxThumbnailHeight = 400;

    const aspectRatio = dimension.width / dimension.height;
    let thumbnailWidth, thumbnailHeight;

    if (aspectRatio > 1) {
      // Landscape orientation
      thumbnailWidth = Math.min(maxThumbnailWidth, dimension.width);
      thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);
    } else {
      // Portrait or square orientation
      thumbnailHeight = Math.min(maxThumbnailHeight, dimension.height);
      thumbnailWidth = Math.round(thumbnailHeight * aspectRatio);
    }

    items.push({
      width: dimension.width,
      height: dimension.height,
      seed: seed,
      model: model,
      enhance: Math.random() > 0.5,
      nologo: true,
      negative_prompt: negativePrompt,
      nofeed: false,
      safe: true,
      quality: quality,
      image: [],
      transparent: false,
      concurrentRequests: 0,
      // Use Pollinations.ai image generation URL with the actual prompt
      // The image will be generated on first request and cached by their CDN
      imageURL: `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dimension.width}&height=${dimension.height}&seed=${seed}&model=${model}&nologo=true`,
      thumbnailURL: `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=400&height=400&seed=${seed}&model=${model}&nologo=true`,
      prompt: fullPrompt,
      isChild: false,
      isMature: false,
      maturity: { isChild: false },
      timingInfo: [{ step: "Generation completed", timestamp: 1000 + i * 100 }],
      status: "end_generating",
      wasPimped: Math.random() > 0.5,
      nsfw: false,
      private: false,
      token: null,
    });
  }

  return items;
};

export async function GET(request: Request) {
  // Get page and limit from URL params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const refresh = searchParams.get("refresh") === "true"; // Check if this is a refresh request
  try {
    // Use real Pollinations feed by default (can be disabled via env)
    const useMockData =
      (process.env.USE_POLLINATIONS_FEED ?? "true") === "false";

    // Cache headers to prevent excessive API calls
    const headers = new Headers();
    headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    let feedItems: PollinationsFeedItem[] = [];

    if (useMockData) {
      console.log("[pollinations-feed] Using mock data");
      // Generate fresh items for the first page
      feedItems = generateMockFeedItems(limit * 3, 0, refresh); // Generate more items for pagination
    } else {
      // Fetch real Pollinations feed via SSE stream for 6 seconds
      console.log("[pollinations-feed] Fetching real SSE feed for 6 seconds...");
      
      try {
        const controller = new AbortController();
        const streamDuration = 6000; // 6 seconds to collect images
        
        // Set timeout to close stream after duration
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, streamDuration);

        const response = await fetch("https://image.pollinations.ai/feed", {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const collectedItems: PollinationsFeedItem[] = [];

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              
              // Process complete SSE messages (separated by \n\n)
              const messages = buffer.split("\n\n");
              buffer = messages.pop() || ""; // Keep incomplete message in buffer

              for (const message of messages) {
                if (!message.trim()) continue;
                
                // SSE format: "data: {...}\n"
                const dataMatch = message.match(/^data: (.+)$/m);
                if (dataMatch) {
                  try {
                    const item = JSON.parse(dataMatch[1]);
                    
                    // Filter safe, quality images
                    if (
                      item.imageURL &&
                      item.prompt &&
                      !item.nsfw &&
                      !item.isChild &&
                      !item.isMature &&
                      item.status === "end_generating"
                    ) {
                      // Generate thumbnail URL if not present
                      if (!item.thumbnailURL && item.imageURL) {
                        item.thumbnailURL = item.imageURL;
                      }
                      collectedItems.push(item);
                      // console.log(`[pollinations-feed] Collected item ${collectedItems.length}: ${item.prompt?.substring(0, 50)}...`);
                    }
                  } catch (parseError) {
                    console.warn("[pollinations-feed] Failed to parse SSE data:", parseError);
                  }
                }
              }
            }
          } catch (readError: any) {
            // AbortError is expected when we close the stream
            if (readError.name !== "AbortError") {
              console.error("[pollinations-feed] Stream read error:", readError);
            }
          } finally {
            reader.releaseLock();
          }
        }

        clearTimeout(timeoutId);
        
        console.log(`[pollinations-feed] Collected ${collectedItems.length} items from SSE feed`);
        
        // Use collected items or fallback to mock if we didn't get enough
        if (collectedItems.length > 0) {
          feedItems = collectedItems;
        } else {
          console.warn("[pollinations-feed] No items collected from SSE, using mock data");
          feedItems = generateMockFeedItems(limit * 3, 0, refresh);
        }
      } catch (fetchError: any) {
        console.error("[pollinations-feed] SSE fetch error:", fetchError);
        // If the fetch fails, use mock data as fallback
        feedItems = generateMockFeedItems(limit * 3, 0, refresh);
      }
    }

    // Generate more mock data for pagination if needed
    if (useMockData && page > 1) {
      const baseOffset = (page - 1) * limit * 1000;
      const additionalItems = generateMockFeedItems(limit, baseOffset);

      return NextResponse.json({
        items: additionalItems,
        timestamp: new Date().toISOString(),
        page: page,
        hasMore: true, // Always allow more SSE bursts
      });
    }

    // For first page or real API data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // If we are using real data, we don't paginate the collected items the same way
    // We just return what we collected (up to a reasonable amount)
    // But if we fell back to mock data, we need to slice
    
    let resultItems = feedItems;
    
    // If we have way too many items, maybe slice? But usually we want all of them.
    // However, if we used mock data fallback, it generated limit*3 items.
    if (feedItems.length > limit * 2) {
       resultItems = feedItems.slice(0, limit * 2);
    }

    return NextResponse.json(
      {
        items: resultItems,
        timestamp: new Date().toISOString(),
        page: page,
        hasMore: true, // Always allow more - each request does a fresh SSE burst
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching Pollinations feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
