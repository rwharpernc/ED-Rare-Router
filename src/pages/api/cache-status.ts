import type { APIRoute } from "astro";
import { getCacheMetadata as getRareSystemsMetadata } from "../../lib/rareSystemsCache";
import { getCacheMetadata as getMarketDataMetadata, isCacheFresh } from "../../lib/edsmMarketCache";

/**
 * Cache status endpoint.
 * 
 * GET /api/cache-status
 * 
 * Returns metadata about all cache files including last updated times.
 */
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const status: {
      rareSystems?: { lastUpdated?: string; totalSystems?: number };
      marketData?: {
        fetchedAt?: string;
        totalRares?: number;
        successCount?: number;
        cacheFresh?: boolean;
      };
    } = {};

    // Get rare systems cache metadata
    try {
      const rareSystemsMeta = await getRareSystemsMetadata();
      if (rareSystemsMeta) {
        status.rareSystems = rareSystemsMeta;
      }
    } catch (error) {
      console.error("[Cache Status] Error getting rare systems metadata:", error);
    }

    // Get market data cache metadata
    try {
      const marketDataMeta = await getMarketDataMetadata();
      const marketDataFresh = await isCacheFresh();
      if (marketDataMeta) {
        status.marketData = {
          ...marketDataMeta,
          cacheFresh: marketDataFresh,
        };
      }
    } catch (error) {
      console.error("[Cache Status] Error getting market data metadata:", error);
    }

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Error in cache-status API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch cache status",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
