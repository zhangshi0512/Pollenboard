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
      // Use optimized dimensions for faster loading
      imageURL: `https://image.pollinations.ai/prompt/${encodeURIComponent(
        fullPrompt
      )}?width=${Math.min(dimension.width, 600)}&height=${Math.round(
        dimension.height * (Math.min(dimension.width, 600) / dimension.width)
      )}&model=${model}&nologo=true&seed=${seed}&quality=medium&enhance=false`,
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
    // Prefer mock unless explicitly enabled via env to avoid timeouts on serverless
    const useMockData = process.env.USE_POLLINATIONS_FEED !== "true";

    // Cache headers to prevent excessive API calls
    const headers = new Headers();
    headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    let feedItems: PollinationsFeedItem[] = [];

    if (useMockData) {
      console.log("[pollinations-feed] Using mock data");
      // Generate fresh items for the first page
      feedItems = generateMockFeedItems(limit * 3, 0, refresh); // Generate more items for pagination
    } else {
      // Fetch real data with a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      try {
        const response = await fetch("https://image.pollinations.ai/feed", {
          method: "GET",
          headers: {
            Accept: "application/json", // Try regular JSON instead of SSE
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Only accept JSON; if non-JSON (SSE), fallback to mock to avoid long-running tasks
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data)) {
            feedItems = data.filter(
              (item) =>
                item.imageURL &&
                item.prompt &&
                !item.nsfw &&
                !item.isChild &&
                !item.isMature
            );
          } else {
            feedItems = data.items || [];
          }
        } else {
          console.warn(
            "[pollinations-feed] Non-JSON response; falling back to mock"
          );
          feedItems = generateMockFeedItems(limit * 3, 0, refresh);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("Fetch error:", fetchError);

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
        hasMore: page < 10, // Limit to 10 pages for demo purposes
      });
    }

    // For first page or real API data
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    // Safety fallback if upstream returned nothing
    if (feedItems.length === 0) {
      feedItems = generateMockFeedItems(limit * 3, 0, refresh);
    }
    const paginatedItems = feedItems.slice(startIndex, endIndex);

    return NextResponse.json(
      {
        items: paginatedItems,
        timestamp: new Date().toISOString(),
        page: page,
        hasMore: endIndex < feedItems.length || page < 10, // Limit to 10 pages for demo purposes
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
