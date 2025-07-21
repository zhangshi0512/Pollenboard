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

export async function GET(request: Request) {
  // Get page and limit from URL params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const seed = searchParams.get("seed") || null; // For generating different sets of mock data
  try {
    // Use a mock response for testing if the real API is causing issues
    // This will help us determine if the issue is with our code or the external API
    const useMockData = true; // Set to true to use mock data instead of API calls

    let feedItems: PollinationsFeedItem[] = [];

    if (useMockData) {
      // Mock data for testing with a variety of images
      feedItems = [
        {
          width: 1080,
          height: 1080,
          seed: 12345,
          model: "flux",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20beautiful%20sunset%20over%20mountains%20with%20vibrant%20colors?width=1080&height=1080&nologo=true",
          prompt:
            "A beautiful sunset over mountains with vibrant colors, golden hour lighting, dramatic clouds, high resolution landscape photography",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1000 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1080,
          height: 1920,
          seed: 67890,
          model: "flux",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "medium",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20futuristic%20city%20with%20flying%20cars%20and%20neon%20lights?width=1080&height=1920&nologo=true",
          prompt:
            "A futuristic city with flying cars and neon lights, cyberpunk aesthetic, night scene, detailed architecture, sci-fi concept art",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1000 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1200,
          height: 800,
          seed: 23456,
          model: "turbo",
          enhance: false,
          nologo: true,
          negative_prompt: "worst quality, blurry, distorted",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20magical%20forest%20with%20glowing%20plants%20and%20fantasy%20creatures?width=1200&height=800&model=turbo&nologo=true",
          prompt:
            "A magical forest with glowing plants and fantasy creatures, ethereal lighting, mystical atmosphere, detailed vegetation, fantasy art style",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1200 }],
          status: "end_generating",
          wasPimped: false,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 800,
          height: 1200,
          seed: 34567,
          model: "playground",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "medium",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/An%20astronaut%20riding%20a%20horse%20on%20Mars?width=800&height=1200&model=playground&nologo=true",
          prompt:
            "An astronaut riding a horse on Mars, surreal digital art, red planet landscape, space suit details, cinematic lighting, high detail",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1500 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1024,
          height: 1024,
          seed: 45678,
          model: "flux",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry, distorted",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20steampunk%20airship%20flying%20through%20clouds?width=1024&height=1024&nologo=true",
          prompt:
            "A steampunk airship flying through clouds, brass and copper details, steam engines, Victorian aesthetic, detailed mechanical parts, dramatic sky",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1300 }],
          status: "end_generating",
          wasPimped: false,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1600,
          height: 900,
          seed: 56789,
          model: "turbo",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/An%20underwater%20city%20with%20bioluminescent%20architecture?width=1600&height=900&model=turbo&nologo=true",
          prompt:
            "An underwater city with bioluminescent architecture, deep sea environment, marine life, glowing elements, futuristic design, blue and teal color palette",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1800 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1080,
          height: 1350,
          seed: 78901,
          model: "playground",
          enhance: false,
          nologo: true,
          negative_prompt: "worst quality, blurry, distorted",
          nofeed: false,
          safe: true,
          quality: "medium",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20fantasy%20castle%20on%20a%20floating%20island?width=1080&height=1350&model=playground&nologo=true",
          prompt:
            "A fantasy castle on a floating island, medieval architecture, waterfalls flowing off the edges, magical atmosphere, detailed stonework, fantasy concept art",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1600 }],
          status: "end_generating",
          wasPimped: false,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1200,
          height: 1200,
          seed: 89012,
          model: "flux",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20Japanese%20garden%20in%20autumn%20with%20maple%20trees?width=1200&height=1200&nologo=true",
          prompt:
            "A Japanese garden in autumn with maple trees, traditional pagoda, stone lanterns, koi pond, red and orange foliage, zen atmosphere, high detail photography",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1400 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1080,
          height: 1080,
          seed: 90123,
          model: "turbo",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry, distorted",
          nofeed: false,
          safe: true,
          quality: "medium",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20cozy%20cabin%20in%20the%20woods%20during%20winter?width=1080&height=1080&model=turbo&nologo=true",
          prompt:
            "A cozy cabin in the woods during winter, snow-covered landscape, warm light from windows, smoke from chimney, pine trees, evening atmosphere, hygge concept",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1100 }],
          status: "end_generating",
          wasPimped: false,
          nsfw: false,
          private: false,
          token: null,
        },
        {
          width: 1024,
          height: 1536,
          seed: 12340,
          model: "playground",
          enhance: true,
          nologo: true,
          negative_prompt: "worst quality, blurry",
          nofeed: false,
          safe: true,
          quality: "high",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL:
            "https://image.pollinations.ai/prompt/A%20colorful%20hot%20air%20balloon%20festival?width=1024&height=1536&model=playground&nologo=true",
          prompt:
            "A colorful hot air balloon festival, dozens of balloons in the sky, vibrant patterns and designs, blue sky with clouds, aerial photography perspective, joyful atmosphere",
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [{ step: "Generation completed", timestamp: 1700 }],
          status: "end_generating",
          wasPimped: true,
          nsfw: false,
          private: false,
          token: null,
        },
      ];
    } else {
      // Fetch real data with a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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

        // Try to parse as JSON first
        try {
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
            // If not an array, try to extract from the data object
            feedItems = data.items || [];
          }
        } catch (jsonError) {
          // If JSON parsing fails, try SSE format
          const text = await response.text();
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line.length > 6) {
              try {
                const jsonData = line.substring(6); // Remove 'data: ' prefix
                const item = JSON.parse(jsonData) as PollinationsFeedItem;

                // Filter out inappropriate content and ensure we have valid data
                if (
                  item.imageURL &&
                  item.prompt &&
                  !item.nsfw &&
                  !item.isChild &&
                  !item.isMature
                ) {
                  feedItems.push(item);
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                continue;
              }
            }
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("Fetch error:", fetchError);

        // If the fetch fails, use mock data as fallback
        feedItems = [
          {
            width: 1080,
            height: 1080,
            seed: 12345,
            model: "flux",
            enhance: true,
            nologo: true,
            negative_prompt: "worst quality, blurry",
            nofeed: false,
            safe: true,
            quality: "medium",
            image: [],
            transparent: false,
            concurrentRequests: 0,
            imageURL:
              "https://image.pollinations.ai/prompt/A%20beautiful%20sunset%20over%20mountains?width=1080&height=1080&nologo=true",
            prompt: "A beautiful sunset over mountains",
            isChild: false,
            isMature: false,
            maturity: { isChild: false },
            timingInfo: [{ step: "Generation completed", timestamp: 1000 }],
            status: "end_generating",
            wasPimped: false,
            nsfw: false,
            private: false,
            token: null,
          },
        ];
      }
    }

    // Generate more mock data for pagination based on seed if needed
    if (useMockData && page > 1) {
      // Create additional mock items with different seeds for subsequent pages
      const baseOffset = (page - 1) * limit * 10000;
      const additionalItems: PollinationsFeedItem[] = [];

      const themes = [
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
      ];

      for (let i = 0; i < limit; i++) {
        const newSeed = baseOffset + i;
        const themeIndex = (i + (page - 1) * limit) % themes.length;
        const theme = themes[themeIndex];
        const modelTypes = ["flux", "turbo", "playground"];
        const model = modelTypes[Math.floor(Math.random() * modelTypes.length)];

        additionalItems.push({
          width: 1080 + (i % 5) * 100,
          height: 1080 + (i % 3) * 200,
          seed: newSeed,
          model: model,
          enhance: Math.random() > 0.5,
          nologo: true,
          negative_prompt: "worst quality, blurry, distorted",
          nofeed: false,
          safe: true,
          quality: Math.random() > 0.5 ? "high" : "medium",
          image: [],
          transparent: false,
          concurrentRequests: 0,
          imageURL: `https://image.pollinations.ai/prompt/${encodeURIComponent(
            theme
          )}?width=${1080 + (i % 5) * 100}&height=${
            1080 + (i % 3) * 200
          }&model=${model}&nologo=true&seed=${newSeed}`,
          prompt: `${theme}, detailed artwork, high quality, professional photography, trending on artstation`,
          isChild: false,
          isMature: false,
          maturity: { isChild: false },
          timingInfo: [
            { step: "Generation completed", timestamp: 1000 + i * 100 },
          ],
          status: "end_generating",
          wasPimped: Math.random() > 0.5,
          nsfw: false,
          private: false,
          token: null,
        });
      }

      // For pages after the first, return the new generated items
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
    const paginatedItems = feedItems.slice(startIndex, endIndex);

    return NextResponse.json({
      items: paginatedItems,
      timestamp: new Date().toISOString(),
      page: page,
      hasMore: endIndex < feedItems.length || page < 10, // Limit to 10 pages for demo purposes
    });
  } catch (error) {
    console.error("Error fetching Pollinations feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
