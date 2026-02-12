# Bulk Market Data Fetch

**ED Rare Router**  
Version: Alpha 1.05  
Last Updated: February 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

## Overview

This document describes the bulk market data fetch system that queries EDSM API for all rare goods stations and saves the data to a local file. This approach:

- ✅ File can be committed to repository
- ✅ Avoids API calls on every request
- ✅ Can be run every 12 hours (or on schedule)
- ✅ Falls back to live API if cache is stale

## How It Works

```
Bulk Fetch Script → EDSM API → data/edsmMarketData.json → API Endpoint → Frontend
```

1. **Bulk Fetch Script** (`scripts/fetch-edsm-market-data.js`):
   - Queries EDSM API for all rare goods stations
   - Saves data to `data/edsmMarketData.json`
   - Skips stations with data less than 12 hours old
   - Includes metadata (fetch time, success/error counts)

2. **Cache File** (`data/edsmMarketData.json`):
   - JSON file with all market data
   - Can be committed to repository
   - Updated by the fetch script

3. **API Endpoint** (`/api/market-data`):
   - Reads from cache file first
   - Falls back to live EDSM API if cache is stale (>12 hours)
   - Returns data source indicator (cache vs. live)

## Usage

### Manual Run

Run the script manually to fetch/update market data:

```bash
npm run fetch:market
```

The script will:
- Load all rare goods from `src/data/rares.ts`
- Query EDSM API for each station (with 500ms delay between requests)
- Skip stations with data less than 12 hours old
- Save results to `data/edsmMarketData.json`

### Automated Runs

#### Option 1: Commit to Repository

1. Run the script locally: `npm run fetch:market`
2. Commit `data/edsmMarketData.json` to the repository
3. Re-run and commit every 12 hours (or as needed)

**Pros**: Simple, version controlled  
**Cons**: Manual process, file in git history

#### Option 3: GitHub Actions / CI/CD

Create a GitHub Actions workflow that runs every 12 hours:

```yaml
name: Fetch Market Data

on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run fetch:market
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'Update market data'
          file_pattern: 'data/edsmMarketData.json'
```

**Pros**: Fully automated, runs on schedule  
**Cons**: Requires GitHub Actions setup

#### Option 4: External Cron Service

Use a service like:
- **cron-job.org** - Free web-based cron
- **EasyCron** - Scheduled HTTP requests
- **GitHub Actions** - As shown above

Set up to call a webhook or trigger a build that runs the script.

## Cache File Structure

The generated `data/edsmMarketData.json` file has this structure:

**Note**: The `totalRares` count is still being verified (140-142 range).

```json
{
  "_metadata": {
    "fetchedAt": "2026-01-12T12:00:00.000Z",
    "totalRares": 140-142,
    "fetchedCount": 50,
    "successCount": 35,
    "errorCount": 10,
    "skippedCount": 97
  },
  "data": {
    "Lave|Lave Station": {
      "rare": "Lavian Brandy",
      "system": "Lave",
      "station": "Lave Station",
      "timestamp": "2026-01-12T10:30:00.000Z",
      "commodity": {
        "name": "Lavian Brandy",
        "buyPrice": 0,
        "sellPrice": 0,
        "stock": 0,
        "stockBracket": 0,
        "demand": 0,
        "demandBracket": 0
      },
      "allCommodities": [...]
    }
  }
}
```

## API Behavior

The `/api/market-data` endpoint:

1. **Checks cache freshness**: Data less than 12 hours old is considered fresh
2. **Uses cache if fresh**: Returns cached data with `source: "cache"`
3. **Falls back to live API**: If cache is stale or missing, queries EDSM API
4. **Returns source indicator**: Shows whether data came from cache or live API

### Example Responses

**From Cache (fresh)**:
```json
{
  "found": true,
  "system": "Lave",
  "station": "Lave Station",
  "rare": "Lavian Brandy",
  "data": {...},
  "source": "cache",
  "cacheFresh": true
}
```

**From Live API (stale cache)**:
```json
{
  "found": true,
  "system": "Lave",
  "station": "Lave Station",
  "rare": "Lavian Brandy",
  "data": {...},
  "source": "live",
  "cacheFresh": false
}
```

## Important Limitations

### EDSM API Does Not Return Market Commodity Data

**Critical**: EDSM's public API does not return market commodity data, even with `showMarket=1`. The API only indicates that a market exists (`haveMarket: true`) but does not include the actual commodities.

**What this means**:
- The bulk fetch script will have **very low success rates** (typically 0-10%)
- Most stations will return "No market data available"
- This is an EDSM API limitation, not a bug in the script

**Why this happens**:
- EDSM's public API is designed for system/station info, not market data
- Market commodity data is not exposed via the public API
- Even if players have uploaded market data, it's not accessible via API

**Solutions**:
- Use **EDDN worker** for real-time market data (recommended)
- Add static purchase prices to `rares.ts` manually
- Accept that EDSM bulk fetch will have limited results

See [EDSM Market Data Limitations](./edsm-market-data-limitations.md) for detailed explanation.

## Performance Considerations

### Request Rate Limiting

The script includes a 2-second delay between requests to be polite to EDSM API:
- 140-142 rare goods × 2 seconds = ~280-284 seconds minimum (~4.7 minutes) (count still being verified)
- Plus API response time = ~5-7 minutes total
- Progress messages show remaining requests and estimated time

### Cache Size

- Each entry: ~1-2 KB
- 140-142 entries: ~200-300 KB total (count still being verified)
- Small enough to commit to repository

### Update Frequency

- **Recommended**: Every 12 hours
- **Minimum**: Once per day
- **Maximum**: Every 6 hours (to avoid unnecessary API calls)

## Troubleshooting

### Script Fails to Start

**Error: "Cannot find module"**
- Run `npm install` first
- Ensure you're in the project root directory

**Error: "Error loading rares"**
- Check that `src/data/rares.ts` exists and is valid
- May need to compile TypeScript first

### No Data Retrieved

**All requests return errors**:
- Check EDSM API status
- Verify network connectivity
- Check if EDSM is rate limiting (wait and retry)

**Some stations return no data**:
- Normal - not all stations have market data
- Depends on player contributions
- Script will keep existing data if available

### Cache File Not Updating

**File exists but script says "skipped"**:
- Data is less than 12 hours old (by design)
- Force update by deleting the file first
- Or modify the script to ignore age check

## Best Practices

1. **Run regularly**: Set up automation to run every 12 hours
2. **Monitor success rate**: Check `_metadata.successCount` in output
3. **Commit updates**: Keep the cache file in version control
4. **Handle errors gracefully**: Script continues even if some requests fail
5. **Respect API limits**: Don't run more frequently than needed

## See Also

- [EDSM Market Data Limitations](./edsm-market-data-limitations.md) - Detailed explanation of EDSM API limitations
- [EDDN Integration](./eddn-integration-research.md) - EDDN integration overview
- [EDDN Worker Setup Guide](./eddn-worker-setup.md) - Real-time market data via EDDN (recommended)
- [EDSM API Documentation](https://www.edsm.net/en/api-system-v1) - EDSM API reference
