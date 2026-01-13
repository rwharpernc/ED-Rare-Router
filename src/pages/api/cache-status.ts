import type { APIRoute } from "astro";
import { getCacheMetadata as getRareSystemsMetadata } from "../../lib/rareSystemsCache";
import { getCacheMetadata as getMarketDataMetadata, isCacheFresh } from "../../lib/edsmMarketCache";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

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
      eddnWorker?: { lastUpdated?: string; totalEntries?: number };
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

    // Get EDDN worker cache metadata (if file exists)
    try {
      const eddnCachePath = join(process.cwd(), "data", "eddnMarketCache.json");
      if (existsSync(eddnCachePath)) {
        const eddnContent = await readFile(eddnCachePath, "utf-8");
        const eddnCache = JSON.parse(eddnContent);
        if (eddnCache._metadata) {
          status.eddnWorker = {
            lastUpdated: eddnCache._metadata.lastUpdated,
            totalEntries: eddnCache._metadata.totalEntries,
          };
        }
      }
    } catch (error) {
      // EDDN cache may not exist, that's okay
      console.debug("[Cache Status] EDDN cache not available:", error);
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
