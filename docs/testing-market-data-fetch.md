# Testing Market Data Fetch Locally

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

## Quick Test

Yes, you can absolutely test the bulk fetch script on your local system! Here's how:

### Step 1: Install Dependencies

Make sure you have all dependencies installed:

```bash
npm install
```

### Step 2: Run the Fetch Script

```bash
npm run fetch:market
```

This will:
- Load all rare goods from `src/data/rares.ts`
- Query EDSM API for each station
- Save results to `data/edsmMarketData.json`
- Show progress and summary

### Step 3: Check the Output

The script will display progress like:

```
[EDSM Market Fetcher] Starting bulk fetch...
[EDSM Market Fetcher] Found 140-142 rare goods to fetch (count still being verified)
[1/140-142] Fetching Lavian Brandy from Lave/Lave Station...
  ✓ Found market data for Lavian Brandy (stock: 0, bracket: 0)
[2/140-142] Fetching Altairian Skin from Altair/Solo Orbiter...
  ✗ No market data available for Altair/Solo Orbiter
...
```

At the end, you'll see a summary:

```
[EDSM Market Fetcher] Summary:
  Total rares: 140-142 (still being verified)
  Fetched: 50
  Success: 35
  Errors: 10
  Skipped (recent): 97
  Data saved to: data/edsmMarketData.json
```

### Step 4: Verify the Output File

Check that the file was created:

```bash
ls -lh data/edsmMarketData.json
```

Or open it to see the structure:

```bash
cat data/edsmMarketData.json | head -50
```

### Step 5: Test the API Endpoint

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

## Expected Results

### Successful Fetch

- File `data/edsmMarketData.json` is created
- Contains `_metadata` with fetch statistics
- Contains `data` object with market entries
- Some entries may have data, others may not (depends on EDSM)

### Partial Success

It's normal to see:
- **Some successes**: Stations with recent player visits will have data
- **Some errors**: Stations without market data (not visited recently)
- **Skipped entries**: If you run it again within 12 hours, recent data is skipped

### No Data Retrieved

If you get 0 successes:
- Check your internet connection
- Verify EDSM API is accessible: `curl https://www.edsm.net/api-system-v1/stations?systemName=Sol`
- Check if EDSM is rate limiting (wait a few minutes and retry)
- Some rare goods stations may genuinely not have data

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

### Script Won't Run

**Error: "Cannot find module '../src/data/rares.ts'"**
- Make sure you're in the project root directory
- TypeScript files should work with Node.js ES modules
- If issues persist, check that `tsconfig.json` is configured correctly

**Error: "SyntaxError: Unexpected token"**
- Ensure you're using Node.js 18+ with ES modules support
- Check `package.json` has `"type": "module"`

### No Data Retrieved

**All requests return errors:**
- Check EDSM API status
- Verify network connectivity
- Check firewall/proxy settings
- Try a single request manually: `curl "https://www.edsm.net/api-system-v1/stations?systemName=Lave&stationName=Lave Station&showMarket=1"`

**Some stations have no data:**
- This is normal - depends on player contributions
- Not all stations are visited frequently
- Rare goods stations may have less data than common stations

### API Endpoint Issues

**404 or 500 errors:**
- Make sure dev server is running
- Check that the endpoint route exists: `src/pages/api/market-data.ts`
- Check browser/terminal console for errors

**Empty responses:**
- Check that cache file exists and is valid JSON
- Verify the API can read the file (check file permissions)
- Check server logs for errors

## Performance Notes

- **First run**: Takes ~2-3 minutes (140-142 requests × 0.5s delay, count still being verified)
- **Subsequent runs**: Faster if many entries are skipped (<12 hours old)
- **File size**: ~200-300 KB for 140-142 entries (count still being verified)
- **API response time**: Depends on EDSM API speed (usually <1 second per request)

## Next Steps

After testing locally:

1. **Commit the cache file** (optional): Add `data/edsmMarketData.json` to git
2. **Set up automation**: See [Bulk Market Data Fetch](./bulk-market-data-fetch.md) for CI/CD options
3. **Monitor success rate**: Check `_metadata.successCount` to see data coverage
4. **Update regularly**: Run every 12 hours or set up automated schedule

## See Also

- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Full documentation
- [Local Deployment Guide](./local-deployment.md) - Deployment instructions
