# Scripts

## fetch-rare-systems.ts

Fetches system coordinate data from EDSM for all rare origin systems and caches it locally.

> **Summary**: This script is **optional but highly recommended** for production deployments. The application will work without the cache (it falls back to live API lookups), but performance will be slower and you'll make more API calls.

### Usage

```bash
npm run fetch-rare-systems
```

### What it does

1. Reads all unique system names from `src/data/rares.ts`
2. Fetches system coordinates and metadata from EDSM API for each system
3. Saves the data to `data/rareSystemsCache.json`
4. Uses rate limiting (200ms between requests) to be polite to EDSM

### Output

Creates/updates `data/rareSystemsCache.json` with:
- System coordinates (x, y, z)
- System allegiance and government (if available)
- Metadata (last updated timestamp, total systems)

### Benefits

- **Faster API responses**: Rare origin systems are loaded from cache instead of API
- **Reduced API calls**: Only user-entered systems (current/target) use API lookups
- **Offline capability**: Works even if EDSM API is temporarily unavailable for rare origins
- **Rate limit friendly**: Pre-fetches data once instead of on every request

### When to run

**Required scenarios:**
- Before first deployment (recommended for production)
- After adding new rare goods to the dataset
- After correcting system names in the rare goods data

**Optional scenarios:**
- Periodically to refresh system data (systems can change over time)

**Note**: The application will work without this cache - it will fall back to live EDSM API lookups for rare origin systems. However, performance will be slower and you'll make more API calls.

### Notes

- Systems that can't be found in EDSM will have placeholder coordinates (0,0,0)
- The cache is loaded automatically by the API endpoints
- User-entered systems (current/target) still use live API lookups for up-to-date data
