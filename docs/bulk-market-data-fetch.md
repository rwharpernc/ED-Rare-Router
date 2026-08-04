# Bulk Market Data Fetch

**ED Rare Router**  
Version: Beta 2
Last Updated: August 4, 2026

**Author:** R.W. Harper (CMDR Mactavious)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

## Overview

This describes the bulk market data fetch system, which queries the EDSM API for all rare goods stations and saves the results to a local file. It avoids hitting the API on every request, can run on a schedule (every 12 hours, say), and the live API is still there as a fallback if the cache goes stale. The generated file is gitignored by default - see "Automated Runs" below for options if you want to persist it somewhere.

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
   - Gitignored by default (matches `data/*.json`); committing it requires an explicit `.gitignore` exception
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
- Query EDSM API for each station (with a 2-second delay between requests)
- Skip stations with data less than 12 hours old
- Save results to `data/edsmMarketData.json`

### Automated Runs

#### Option 1: Commit to Repository

`data/edsmMarketData.json` is gitignored by default (it matches the `data/*.json` pattern). To use this option, first add an exception in `.gitignore` (e.g. `!data/edsmMarketData.json`), then:

1. Run the script locally: `npm run fetch:market`
2. Commit `data/edsmMarketData.json` to the repository
3. Re-run and commit every 12 hours (or as needed)

**Pros**: Simple, version controlled  
**Cons**: Manual process, file in git history, requires opting out of the default gitignore rule

#### Option 2: GitHub Actions / CI/CD

Create a GitHub Actions workflow that runs every 12 hours. This also needs the `.gitignore` exception from Option 1 above, since `git-auto-commit-action` won't add a gitignored file:

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

#### Option 3: External Cron Service

Use a service like:
- **cron-job.org** - Free web-based cron
- **EasyCron** - Scheduled HTTP requests
- **GitHub Actions** - As shown above

Set up to call a webhook or trigger a build that runs the script.

## Cache File Structure

The generated `data/edsmMarketData.json` file has this structure:

```json
{
  "_metadata": {
    "fetchedAt": "2026-01-12T12:00:00.000Z",
    "totalRares": 142,
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

EDSM's public API doesn't return market commodity data, so expect a low success rate from the bulk fetch - that's an API limitation, not a bug in the script. See [EDSM Market Data Limitations](./edsm-market-data-limitations.md) (the canonical explanation) for why, and your options for filling the gap.

## Performance Considerations

### Request Rate Limiting

The script includes a 2-second delay between requests to be polite to EDSM API:
- 142 rare goods × 2 seconds = 284 seconds minimum (~4.7 minutes)
- Plus API response time = ~5-7 minutes total
- Progress messages show remaining requests and estimated time

### Cache Size

- Each entry: ~1-2 KB
- 142 entries: ~200-300 KB total
- Small enough to commit to the repository, if you've opted out of the default gitignore rule (see "Automated Runs" above)

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
3. **Commit updates** (optional): If you've opted out of the default gitignore rule, keep the cache file in version control
4. **Handle errors gracefully**: Script continues even if some requests fail
5. **Respect API limits**: Don't run more frequently than needed

## See Also

- [EDSM Market Data Limitations](./edsm-market-data-limitations.md) - Detailed explanation of EDSM API limitations
- [EDSM API Documentation](https://www.edsm.net/en/api-system-v1) - EDSM API reference
