# Scripts

## fetch-rare-systems.ts

Fetches system coordinate data from EDSM for all rare origin systems and caches it locally.

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

- After adding new rare goods to the dataset
- Periodically to refresh system data (systems can change)
- After system names are corrected in the rare goods data

### Notes

- Systems that can't be found in EDSM will have placeholder coordinates (0,0,0)
- The cache is loaded automatically by the API endpoints
- User-entered systems (current/target) still use live API lookups for up-to-date data
