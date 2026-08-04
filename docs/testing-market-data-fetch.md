# Testing Market Data Fetch Locally

**ED Rare Router**  
Version: Beta 2
Last Updated: August 4, 2026

**Author:** R.W. Harper (CMDR Mactavious)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

## Quick Test

This doc covers verifying the bulk fetch and market-data API once you've run them - see [Bulk Market Data Fetch](./bulk-market-data-fetch.md) for how the script and cache actually work, what its output looks like, and its own troubleshooting/performance notes.

### Run it once

```bash
npm install
npm run fetch:market
```

Then confirm the cache file exists and has the expected shape:

```bash
ls -lh data/edsmMarketData.json
cat data/edsmMarketData.json | jq '._metadata'
```

### Test the API Endpoint

Start your development server:

```bash
npm run dev
```

Then test the API endpoint:

```bash
# Get market data for a specific rare good
curl "http://localhost:4321/api/market-data?system=Lave&station=Lave Station&rare=Lavian Brandy"

# Get all cached market data
curl "http://localhost:4321/api/market-data"
```

A 0-success first run is normal - see [EDSM Market Data Limitations](./edsm-market-data-limitations.md) for why.

## Testing Scenarios

### Test 1: First Run (Empty Cache)

```bash
# Delete existing cache (if any)
rm -f data/edsmMarketData.json

# Run fetch
npm run fetch:market

# Check results
cat data/edsmMarketData.json | jq '._metadata'
```

### Test 2: Second Run (With Cache)

```bash
# Run again immediately
npm run fetch:market

# Should see many "Skipped" messages
# Check that existing data is preserved
cat data/edsmMarketData.json | jq '.data | keys | length'
```

### Test 3: API Endpoint with Cache

```bash
# Start dev server
npm run dev

# In another terminal, test API
curl "http://localhost:4321/api/market-data?system=Lave&station=Lave Station&rare=Lavian Brandy" | jq
```

Should return:
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

### Test 4: API Endpoint without Cache

```bash
# Delete cache
rm -f data/edsmMarketData.json

# Test API (should fall back to live API)
curl "http://localhost:4321/api/market-data?system=Lave&station=Lave Station&rare=Lavian Brandy" | jq
```

Should return:
```json
{
  "found": true,
  "source": "live",
  "cacheFresh": false,
  ...
}
```

## Troubleshooting

For script-side issues (won't start, no data retrieved), see [Bulk Market Data Fetch - Troubleshooting](./bulk-market-data-fetch.md#troubleshooting). API-endpoint-specific issues:

**404 or 500 errors:**
- Make sure dev server is running
- Check that the endpoint route exists: `src/pages/api/market-data.ts`
- Check browser/terminal console for errors

**Empty responses:**
- Check that cache file exists and is valid JSON
- Verify the API can read the file (check file permissions)
- Check server logs for errors

Performance figures (run time, file size) are in [Bulk Market Data Fetch - Performance Considerations](./bulk-market-data-fetch.md#performance-considerations).

## Next Steps

After testing locally:

1. **Commit the cache file** (optional): Add `data/edsmMarketData.json` to git
2. **Set up automation**: See [Bulk Market Data Fetch](./bulk-market-data-fetch.md) for CI/CD options
3. **Monitor success rate**: Check `_metadata.successCount` to see data coverage
4. **Update regularly**: Run every 12 hours or set up automated schedule

## See Also

- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Full documentation
- [Local Deployment Guide](./local-deployment.md) - Deployment instructions
