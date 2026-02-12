/**
 * EDSM Market Data Client
 * 
 * Queries EDSM API for market/commodity data at stations.
 * Works with local file-based caching (no persistent processes needed).
 * 
 * Note: EDSM market data may not always be available or up-to-date for rare goods.
 */

import type { EDSMSystem } from "./edsm";
import { getEdsmUserAgent } from "./config";

const EDSM_API_BASE = "https://www.edsm.net/api-system-v1";
const FETCH_TIMEOUT_MS = 10000; // 10 seconds timeout

/**
 * Market commodity data from EDSM
 */
export interface EDSMCommodity {
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  stockBracket: number;
  demand: number;
  demandBracket: number;
}

/**
 * Market data for a station
 */
export interface EDSMStationMarket {
  systemName: string;
  stationName: string;
  commodities?: EDSMCommodity[];
  timestamp?: string;
}

/**
 * Create a fetch request with timeout and proper headers
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": getEdsmUserAgent(),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Get market data for a specific station
 * 
 * @param systemName - System name
 * @param stationName - Station name
 * @returns Market data or null if not available
 */
export async function getStationMarket(
  systemName: string,
  stationName: string
): Promise<EDSMStationMarket | null> {
  if (!systemName || !stationName) {
    return null;
  }

  try {
    // EDSM API endpoint for station market data
    // Note: This endpoint may not always return market data
    const response = await fetchWithTimeout(
      `${EDSM_API_BASE}/stations?systemName=${encodeURIComponent(
        systemName
      )}&stationName=${encodeURIComponent(stationName)}&showMarket=1`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          `[EDSM Market] Station "${stationName}" in "${systemName}" not found (404)`
        );
        return null;
      }
      console.warn(
        `[EDSM Market] API returned ${response.status} for ${systemName}/${stationName}`
      );
      return null;
    }

    const data = await response.json();

    // EDSM API returns a system object with stations array, not a direct array
    const stations = data.stations || (Array.isArray(data) ? data : []);

    if (!stations || stations.length === 0) {
      return null;
    }

    // Find the matching station
    const station = stations.find(
      (s: any) =>
        s.name?.toLowerCase() === stationName.toLowerCase() ||
        s.marketId
    );

    if (!station) {
      return null;
    }

    // Check if station has market
    if (!station.haveMarket) {
      return null;
    }

    // EDSM API doesn't always return market commodities even with showMarket=1
    // Market data depends on recent player uploads
    if (!station.market || !station.market.commodities) {
      return null;
    }

    // Extract market data
    const marketData: EDSMStationMarket = {
      systemName,
      stationName: station.name || stationName,
      timestamp: station.updateTime?.market || station.market?.updateTime || new Date().toISOString(),
      commodities: station.market.commodities.map((c: any) => ({
        name: c.name,
        buyPrice: c.buyPrice || 0,
        sellPrice: c.sellPrice || 0,
        stock: c.stock || 0,
        stockBracket: c.stockBracket || 0,
        demand: c.demand || 0,
        demandBracket: c.demandBracket || 0,
      })),
    };

    return marketData;
  } catch (error) {
    console.error(
      `[EDSM Market] Error fetching market data for ${systemName}/${stationName}:`,
      error
    );
    return null;
  }
}

/**
 * Get market data for a rare good at its origin station
 * 
 * @param rareName - Name of the rare good
 * @param systemName - Origin system name
 * @param stationName - Origin station name
 * @returns Commodity data for the rare good, or null if not available
 */
export async function getRareGoodMarketData(
  rareName: string,
  systemName: string,
  stationName: string
): Promise<EDSMCommodity | null> {
  const marketData = await getStationMarket(systemName, stationName);

  if (!marketData || !marketData.commodities) {
    return null;
  }

  // Find the rare good in the commodities list
  const rareCommodity = marketData.commodities.find(
    (c) => c.name.toLowerCase() === rareName.toLowerCase()
  );

  return rareCommodity || null;
}
