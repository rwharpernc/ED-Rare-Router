/**
 * Bulk Fetch EDSM Market Data for Rare Goods
 * 
 * This script queries EDSM API for market data at all rare goods stations
 * and saves it to a local JSON file. This file can then be committed to the repo
 * or generated during build, avoiding API calls on every request.
 * 
 * Run this script:
 * - Manually: node scripts/fetch-edsm-market-data.js
 * - In CI/CD: As a build step (runs every 12 hours or on schedule)
 * - Locally: Before committing updates
 * 
 * Usage: node scripts/fetch-edsm-market-data.js
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getDataDir, getEdsmUserAgent } from './load-config.js';

const EDSM_API_BASE = 'https://www.edsm.net/api-system-v1';
const OUTPUT_FILE = join(getDataDir(), 'edsmMarketData.json');
const FETCH_TIMEOUT_MS = 15000; // 15 seconds timeout
const DELAY_BETWEEN_REQUESTS_MS = 2000; // 2 seconds delay between requests to be polite to EDSM

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': getEdsmUserAgent(),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Get market data for a station from EDSM
 */
async function getStationMarket(systemName, stationName) {
  try {
    const url = `${EDSM_API_BASE}/stations?systemName=${encodeURIComponent(
      systemName
    )}&stationName=${encodeURIComponent(stationName)}&showMarket=1`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Station not found
      }
      console.warn(
        `[EDSM] API returned ${response.status} for ${systemName}/${stationName}`
      );
      return null;
    }

    const data = await response.json();

    // EDSM API returns a system object with stations array, not a direct array
    const stations = data.stations || (Array.isArray(data) ? data : []);
    
    if (!stations || stations.length === 0) {
      console.warn(`[EDSM] No stations found for ${systemName}/${stationName}`);
      return null;
    }

    // Find matching station
    const station = stations.find(
      (s) =>
        s.name?.toLowerCase() === stationName.toLowerCase() || s.marketId
    );

    if (!station) {
      console.warn(`[EDSM] Station "${stationName}" not found in ${systemName}`);
      return null;
    }

    // Check if station has market
    if (!station.haveMarket) {
      console.warn(`[EDSM] Station "${stationName}" in ${systemName} does not have a market`);
      return null;
    }

    // EDSM API doesn't return market commodities in the stations endpoint
    // The market data is only available if someone has uploaded it recently
    // and it's not guaranteed to be in the response even with showMarket=1
    if (!station.market || !station.market.commodities) {
      console.warn(
        `[EDSM] Market data not available for ${systemName}/${stationName} (market exists but no commodity data)`
      );
      return null;
    }

    return {
      systemName,
      stationName: station.name || stationName,
      marketId: station.marketId,
      timestamp: station.updateTime?.market || station.market?.updateTime || new Date().toISOString(),
      commodities: station.market.commodities.map((c) => ({
        name: c.name,
        buyPrice: c.buyPrice || 0,
        sellPrice: c.sellPrice || 0,
        stock: c.stock || 0,
        stockBracket: c.stockBracket || 0,
        demand: c.demand || 0,
        demandBracket: c.demandBracket || 0,
      })),
    };
  } catch (error) {
    console.error(
      `[EDSM] Error fetching market data for ${systemName}/${stationName}:`,
      error.message
    );
    return null;
  }
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function fetchAllMarketData() {
  console.log('[EDSM Market Fetcher] Starting bulk fetch...');

  // Import rares data
  let rares;
  try {
    const raresModule = await import('../src/data/rares.ts');
    rares = raresModule.rares || [];
  } catch (error) {
    console.error('[EDSM Market Fetcher] Error loading rares:', error);
    process.exit(1);
  }

  console.log(`[EDSM Market Fetcher] Found ${rares.length} rare goods to fetch`);

  // Load existing data to preserve what we can
  let existingData = {};
  if (existsSync(OUTPUT_FILE)) {
    try {
      const content = await readFile(OUTPUT_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      existingData = parsed.data || {};
      console.log(
        `[EDSM Market Fetcher] Loaded ${Object.keys(existingData).length} existing entries`
      );
    } catch (error) {
      console.warn('[EDSM Market Fetcher] Could not load existing data:', error.message);
    }
  }

  const results = {
    _metadata: {
      fetchedAt: new Date().toISOString(),
      totalRares: rares.length,
      fetchedCount: 0,
      successCount: 0,
      errorCount: 0,
      skippedCount: 0,
    },
    data: {},
  };

  // Fetch market data for each rare good
  for (let i = 0; i < rares.length; i++) {
    const rare = rares[i];
    const key = `${rare.system}|${rare.station}`;
    const current = i + 1;
    const total = rares.length;
    const remaining = total - current;
    
    // Check if we already have recent data (within 12 hours)
    if (existingData[key]) {
      const existingTimestamp = existingData[key].timestamp;
      if (existingTimestamp) {
        const existingDate = new Date(existingTimestamp);
        const hoursSinceUpdate =
          (Date.now() - existingDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 12) {
          console.log(
            `[${current}/${total}] Skipping ${rare.rare} (${rare.system}/${rare.station}) - data is ${hoursSinceUpdate.toFixed(1)} hours old`
          );
          results.data[key] = existingData[key];
          results._metadata.skippedCount++;
          continue;
        }
      }
    }

    results._metadata.fetchedCount++;

    const marketData = await getStationMarket(rare.system, rare.station);

    if (marketData) {
      // Find the rare good in commodities
      const rareCommodity = marketData.commodities?.find(
        (c) => c.name.toLowerCase() === rare.rare.toLowerCase()
      );

      if (rareCommodity) {
        results.data[key] = {
          rare: rare.rare,
          system: rare.system,
          station: rare.station,
          timestamp: marketData.timestamp,
          commodity: rareCommodity,
          allCommodities: marketData.commodities, // Store all commodities for reference
        };
        results._metadata.successCount++;
        console.log(
          `  ✓ Found market data for ${rare.rare} (stock: ${rareCommodity.stock}, bracket: ${rareCommodity.stockBracket})`
        );
      } else {
        results._metadata.errorCount++;
        console.log(`  ✗ Rare good "${rare.rare}" not found in market commodities`);
        // Keep existing data if available
        if (existingData[key]) {
          results.data[key] = existingData[key];
        }
      }
    } else {
      results._metadata.errorCount++;
      console.log(`  ✗ No market data available for ${rare.system}/${rare.station}`);
      console.log(`    Note: EDSM API doesn't always return market commodity data - depends on recent player uploads`);
      // Keep existing data if available
      if (existingData[key]) {
        results.data[key] = existingData[key];
      }
    }

    // Be polite to EDSM API - delay between requests
    if (i < rares.length - 1) {
      const remaining = rares.length - (i + 1);
      const estimatedSeconds = Math.ceil((remaining * DELAY_BETWEEN_REQUESTS_MS) / 1000);
      const estimatedMinutes = Math.floor(estimatedSeconds / 60);
      const estimatedSecondsRemainder = estimatedSeconds % 60;
      const timeEstimate = estimatedMinutes > 0 
        ? `${estimatedMinutes}m ${estimatedSecondsRemainder}s`
        : `${estimatedSecondsRemainder}s`;
      
      console.log(`  Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s before next request... (${remaining} remaining, ~${timeEstimate} estimated)`);
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  // Ensure data directory exists
  const dataDir = getDataDir();
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  // Write results to file
  await writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n[EDSM Market Fetcher] Summary:');
  console.log(`  Total rares: ${results._metadata.totalRares}`);
  console.log(`  Fetched: ${results._metadata.fetchedCount}`);
  console.log(`  Success: ${results._metadata.successCount}`);
  console.log(`  Errors: ${results._metadata.errorCount}`);
  console.log(`  Skipped (recent): ${results._metadata.skippedCount}`);
  console.log(`  Data saved to: ${OUTPUT_FILE}`);
  console.log('\n[EDSM Market Fetcher] Done!');
}

// Run the script
fetchAllMarketData().catch((error) => {
  console.error('[EDSM Market Fetcher] Fatal error:', error);
  process.exit(1);
});
