# EDSM Market Data Limitations

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

## Important: EDSM API Limitations

### Market Commodity Data Not Available

**EDSM's public API does not return market commodity data** for stations, even when using the `showMarket=1` parameter.

### What the API Returns

The EDSM stations endpoint (`/api-system-v1/stations`) returns:
- ✅ Station information (name, type, services)
- ✅ Market existence indicator (`haveMarket: true/false`)
- ✅ Market update timestamp (`updateTime.market`)
- ❌ **Market commodity data is NOT included**

### Why This Happens

1. **API Design**: EDSM's public API is designed for system/station information, not detailed market data
2. **Data Privacy**: Market commodity data may be considered more sensitive
3. **Rate Limiting**: Full market data would require separate endpoints or higher API limits
4. **Data Availability**: Market data depends on player uploads via EDMC, which may be incomplete

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

### Option 1: Use EDDN Worker (Recommended)

The **EDDN worker service** provides real-time market data as players upload it:

- ✅ Real-time updates as players visit stations
- ✅ Includes commodity data (buyPrice, sellPrice, stock, etc.)
- ✅ More reliable than EDSM API for market data
- ⚠️ Requires ZeroMQ and separate worker process

See [EDDN Worker Setup Guide](./eddn-worker-setup.md) for details.

### Option 2: Accept Limited Data

- Accept that EDSM bulk fetch will have low success rates
- Use the data that is available
- Supplement with manual data entry if needed

### Option 3: Manual Data Entry

- Add static purchase prices to `rares.ts` manually
- Update as needed from Inara or other sources
- Most reliable but requires manual maintenance

## Why EDDN is Better for Market Data

**EDDN (Elite Dangerous Data Network)** is specifically designed for market data:
- Receives data directly from players via EDMC
- Includes full commodity information
- Real-time updates
- Designed for market data distribution

**EDSM API** is designed for:
- System and station information
- Exploration data
- General station services
- Not optimized for market commodity data

## Recommendations

1. **For Real-time Market Data**: Use the EDDN worker service
2. **For Static Purchase Prices**: Add to `rares.ts` manually
3. **For Bulk Fetching**: Accept low success rates, use as supplementary data

## See Also

- [EDDN Worker Setup Guide](./eddn-worker-setup.md) - Real-time market data
- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - EDSM bulk fetch guide
- [EDDN Integration](./eddn-integration-research.md) - EDDN overview
