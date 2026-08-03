# EDSM Market Data Limitations

**ED Rare Router**  
Version: Beta 1
Last Updated: August 3, 2026

**Author:** R.W. Harper  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

## Important: EDSM API Limitations

### Market Commodity Data Not Available

**EDSM's public API does not return market commodity data** for stations, even when using the `showMarket=1` parameter.

### What the API returns

The EDSM stations endpoint (`/api-system-v1/stations`) gives you station info (name, type, services), a market existence flag (`haveMarket: true/false`), and a market update timestamp (`updateTime.market`) - but no actual commodity data.

### Why

- EDSM's public API is built for system/station info, not detailed market data
- Market commodity data may be treated as more sensitive
- Full market data would need separate endpoints or higher rate limits
- It depends on player uploads via EDMC anyway, which are inherently incomplete

### What You'll See

When running the bulk fetch script (`npm run fetch:market`), you'll likely see:
- Many stations return "No market data available"
- Some stations may have market data if recently uploaded by players
- Success rate is typically very low (0-10% for rare goods stations)

### Example Output

```
[1/140-142] Fetching Lavian Brandy from Lave/Lave Station... (count still being verified)
  ✗ No market data available for Lave/Lave Station
    Note: EDSM API doesn't always return market commodity data - depends on recent player uploads
[2/140-142] Fetching Altairian Skin from Altair/Solo Orbiter...
  ✗ No market data available for Altair/Solo Orbiter
```

## Solutions

### Option 1: Accept Limited Data

- Accept that EDSM bulk fetch will have low success rates
- Use the data that is available
- Supplement with manual data entry if needed

### Option 2: Manual Data Entry

- Add static purchase prices to `rares.ts` manually, or via the `/curate-prices` interface (development mode)
- Update as needed from Inara or other sources
- Most reliable but requires manual maintenance

## Recommendations

1. **For Purchase Prices**: Add to `rares.ts` manually or curate via `/curate-prices`
2. **For Bulk Fetching**: Accept low success rates, use as supplementary data

## See Also

- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - EDSM bulk fetch guide
