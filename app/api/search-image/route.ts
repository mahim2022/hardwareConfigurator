import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

export const dynamic = "force-dynamic";

/**
 * GET /api/search-image?q=<pcName>
 * 
 * Searches for product images using SerpApi Google Shopping
 * Returns the first high-quality image URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      console.warn("SERPAPI_KEY not configured");
      return NextResponse.json(
        { error: "SerpApi not configured", imageUrl: null },
        { status: 200 }
      );
    }

    // Use SerpApi to search Google Shopping for product images
    const response = await getJson({
      api_key: apiKey,
      engine: "google_shopping",
      q: query,
      gl: "us", // Country
      hl: "en", // Language
    });

    // Extract the first product image
    const shoppingResults = response.shopping_results;
    
    if (shoppingResults && shoppingResults.length > 0) {
      // Try to get the thumbnail or main image from the first result
      const firstResult = shoppingResults[0];
      const imageUrl = firstResult.thumbnail || firstResult.image || null;
      
      return NextResponse.json({ 
        imageUrl,
        title: firstResult.title || query,
        source: firstResult.source || "Unknown"
      });
    }

    // Fallback: try Google Images if Shopping didn't work
    const imagesResponse = await getJson({
      api_key: apiKey,
      engine: "google_images",
      q: query,
      gl: "us",
      hl: "en",
    });

    const imagesResults = imagesResponse.images_results;
    
    if (imagesResults && imagesResults.length > 0) {
      const firstImage = imagesResults[0];
      return NextResponse.json({
        imageUrl: firstImage.original || firstImage.thumbnail,
        title: firstImage.title || query,
        source: firstImage.source || "Google Images"
      });
    }

    // No results found
    return NextResponse.json({
      imageUrl: null,
      title: query,
      source: null
    });

  } catch (error) {
    console.error("SerpApi search error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to search for image",
        imageUrl: null 
      },
      { status: 500 }
    );
  }
}
