# Troubleshooting Notes & Explanations

**ED Rare Router**  
Last Updated: February 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

---

## Rare Commodities Count Discrepancy

### Issue
The dataset contains **142 rare commodities**, but external references indicate **140 rare commodities**. This 2-item discrepancy requires investigation.

### Analysis (February 12, 2026)

**Verification Results:**
- Total entries in `src/data/rares.ts`: **142**
- Unique rare names: **142**
- Duplicate rare names: **0**
- Items appearing in multiple locations: **0**

**Conclusion:** There are no duplicate entries in the dataset. All 142 items are unique rare commodities.

### Potential Reasons for Discrepancy

#### 1. Onionhead Variants (3 items)
Some sources may count Onionhead variants as a single item:
- `Onionhead`
- `Onionhead Alpha Strain`
- `Onionhead Beta Strain`
- `Lucan Onionhead` (separate item, different location)

**Note:** These are distinct items with different names and locations, but some references may group the first three together.

#### 2. Ophiuch Items (2 items)
Two related items from different systems:
- `Ophiuchi Exino` (from 39 Tauri)
- `Ophiuch Exino Artefacts` (from 36 Ophiuchi)

**Note:** These are separate items from different systems, but the similar names might cause confusion in some references.

#### 3. Special Cases
Some sources may exclude certain items from the "rare commodities" count:
- Items that are no longer available in-game
- Items that are considered "special" rather than standard rare commodities
- Items that require special conditions to obtain

### Items to Verify

The following items should be cross-referenced with authoritative sources to confirm they are standard rare commodities:

1. **Onionhead variants** - Verify if all three strains should be counted separately
2. **Ophiuch items** - Verify if both should be counted or if one is a variant
3. **Any items marked as "special" or "limited"** - Check if these are excluded from standard counts

### Current Status

- **Dataset count**: 142 items
- **Reference count**: 140 items
- **Discrepancy**: 2 items
- **Status**: Still being verified
- **Documentation**: Updated to reflect "140-142 rare commodities (still being verified)"

### Next Steps

1. Compare dataset against authoritative reference (e.g., Inara.cz complete list)
2. Identify which 2 items are the discrepancy
3. Determine if discrepancy is due to:
   - Counting methodology (variants vs. separate items)
   - Items no longer in-game
   - Special cases excluded from standard count
4. Update documentation once verified

### Related Files

- `src/data/rares.ts` - Main dataset
- `README.md` - Updated to show "140-142 (still being verified)"
- `docs/data-appendix.md` - Dataset statistics

---

## EDDN Market Data Limitations

### Issue
EDSM API does not return market commodity data via public API endpoints.

### Explanation
Even when using `showMarket=1` parameter, the EDSM API only returns:
- `haveMarket: true` (indicates market exists)
- `updateTime.market` (last update timestamp)
- **No `market.commodities` array** (commodity data is not included)

### Why This Happens
- EDSM's public API is designed for system/station information, not market data
- Market commodity data is not exposed via the public API
- Even if players have uploaded market data, it's not accessible via API
- Market data requires direct database access or EDDN integration

### Solutions
1. **EDDN Worker** (Recommended) - Real-time market data via ZeroMQ
2. **Manual Price Curation** - Add baseline prices via `/curate-prices` interface
3. **Accept Limited Results** - Use EDDN worker for real-time data

### Related Files
- `docs/edsm-market-data-limitations.md` - Detailed explanation
- `docs/bulk-market-data-fetch.md` - Bulk fetch documentation
- `workers/eddn-worker.js` - EDDN worker implementation

---

## Price Display Priority System

### How Prices Are Determined

The application uses a priority system when displaying costs:

1. **EDDN Live Market Data** (Highest Priority)
   - Real-time data from EDDN worker
   - Shows: `"(Live)"` label
   - Source: `data/eddnMarketCache.json`
   - Updated: Real-time as EDDN messages are received

2. **Curated Baseline Prices** (Second Priority)
   - Manually entered via `/curate-prices` interface
   - Shows: `"(Est.)"` label
   - Source: `data/curatedPrices.json`
   - Updated: Manual curation in development mode

3. **Static Costs from Base Data** (Third Priority)
   - Hardcoded in `src/data/rares.ts`
   - Shows: `"(Est.)"` label
   - Source: Static dataset
   - Updated: Code changes only

4. **"N/A"** (Fallback)
   - Displayed when none of the above are available

### Why This System Exists

- **EDDN data** is most accurate but requires worker to be running
- **Curated prices** provide fallback when EDDN data isn't available
- **Static costs** provide baseline for items without curated data
- **"N/A"** indicates no price information is available

### Related Files
- `src/lib/eddnMarketCache.ts` - EDDN cache reader
- `src/lib/curatedPrices.ts` - Price curation system
- `src/pages/api/rares-scan.ts` - Price priority logic
- `src/components/ResultsList.tsx` - Price display logic

---

## Cache Status API Fix

### Issue
`existsSync is not a function` error in cache-status API endpoint.

### Root Cause
`existsSync` was incorrectly imported from `fs/promises` instead of `fs`.

### Explanation
- `fs/promises` contains only **async** functions (returns Promises)
- `existsSync` is a **synchronous** function and exists only in `fs`
- Mixing imports caused the function to be undefined

### Fix Applied
Changed from:
```typescript
import { readFile, existsSync } from "fs/promises";
```

To:
```typescript
import { readFile } from "fs/promises";
import { existsSync } from "fs";
```

### Related Files
- `src/pages/api/cache-status.ts` - Fixed import

---

## EDDN Worker ZeroMQ v6 API Migration

### Issue
ZeroMQ v6 uses a different API than v5, causing `zmq.socket is not a function` errors.

### Root Cause
ZeroMQ v6 changed from function-based API to class-based API.

### Changes Required

1. **Import Change**:
   ```typescript
   // Old (v5)
   import zmq from 'zeromq';
   
   // New (v6)
   import { Subscriber } from 'zeromq';
   ```

2. **Socket Creation**:
   ```typescript
   // Old (v5)
   const subscriber = zmq.socket('sub');
   
   // New (v6)
   const subscriber = new Subscriber();
   ```

3. **Connection**:
   ```typescript
   // Old (v5)
   subscriber.connect(EDDN_RELAY);
   
   // New (v6)
   await subscriber.connect(EDDN_RELAY);
   ```

4. **Message Handling**:
   ```typescript
   // Old (v5) - Event-based
   subscriber.on('message', (topic, message) => {
     processMarketMessage(message);
   });
   
   // New (v6) - Async iteration
   for await (const [topic, message] of subscriber) {
     await processMarketMessage(message);
   }
   ```

5. **Shutdown**:
   ```typescript
   // Old (v5)
   subscriber.close();
   
   // New (v6)
   await subscriber.close();
   ```

### Additional Changes

- **Message Decompression**: EDDN messages are zlib-compressed and must be decompressed before parsing
- **Frame Structure**: ZeroMQ v6 returns frames differently - may be array or single value
- **Error Handling**: Socket closure errors should be handled gracefully

### Related Files
- `workers/eddn-worker.js` - Updated to v6 API
- `package.json` - Uses `zeromq@^6.0.0-beta.20`

---

## Nested EDDN Cache Structure

### Issue
EDDN cache file has deeply nested structure: `{ _metadata: {...}, data: { _metadata: {...}, data: { _metadata: {...}, data: {} } } }`

### Root Cause
Worker's `saveCache()` function was saving `marketCache` which may have already contained nested structure from previous saves. The cache loading logic didn't properly unwrap nested structures.

### Fix Applied

1. **Cache Loading** (`workers/eddn-worker.js`):
   - Added logic to detect and unwrap nested structures
   - Ensures `marketCache` is always a flat object

2. **Cache Reading** (`src/lib/eddnMarketCache.ts`):
   - Added recursive unwrapping logic
   - Handles deeply nested structures
   - Detects actual market data by checking for keys that look like "System|Station"

### Prevention
- Worker now ensures `marketCache` is always flat before saving
- Cache reader handles nested structures gracefully
- Future saves will maintain correct structure

### Related Files
- `workers/eddn-worker.js` - Cache save/load logic
- `src/lib/eddnMarketCache.ts` - Cache reader with unwrapping

---

## Price Curation System Design

### Why Manual Curation?

1. **No Public API**: No public API provides baseline purchase prices for rare goods
2. **EDDN Dependency**: Real-time prices require EDDN worker to be running and receiving data
3. **Fallback Needed**: Users need price information even when EDDN data isn't available
4. **Data Accuracy**: Manual curation allows verification and correction of prices

### Design Decisions

1. **Development-Only Interface**: Price curation is only available in development mode for security
2. **Separate from Legality**: Price curation is separate from legality curation for clarity
3. **Fallback Priority**: Curated prices are used as fallback, not primary source
4. **JSON Storage**: Simple file-based storage for easy backup and version control

### Related Files
- `src/lib/curatedPrices.ts` - Price curation library
- `src/pages/api/curated-prices.ts` - Price curation API
- `src/components/PriceCurator.tsx` - Price editor component
- `src/pages/curate-prices.astro` - Price curation page

---

## Future Notes

This document will be updated as new issues are discovered, analyzed, and resolved. When adding new entries:

1. **Date the entry** - Include when the issue was discovered/resolved
2. **Explain the root cause** - Not just the symptom
3. **Document the fix** - Include code examples if applicable
4. **Link related files** - Help future developers find relevant code
5. **Note prevention** - How to avoid the issue in the future
