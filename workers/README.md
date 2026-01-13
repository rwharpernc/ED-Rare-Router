# EDDN Worker Service

This directory contains the EDDN (Elite Dangerous Data Network) worker service that connects to EDDN via ZeroMQ and caches rare goods market data.

## Overview

The worker service:
- Connects to EDDN relay servers via ZeroMQ
- Filters market messages for rare goods stations
- Caches market data to `data/eddnMarketCache.json`
- Provides data to the Astro API via the cache file

## Prerequisites

1. **ZeroMQ**: The worker requires ZeroMQ. Install system dependencies:
   - **Windows**: Download from https://zeromq.org/download/
   - **macOS**: `brew install zeromq`
   - **Linux**: `sudo apt-get install libzmq3-dev` (Debian/Ubuntu) or equivalent

2. **Node.js**: Node.js 18+ with ES modules support

## Installation

1. Install dependencies:
```bash
npm install
```

This will install the `zeromq` package.

## Usage

### Development

Run the worker in development mode (with auto-restart on file changes):
```bash
npm run worker:dev
```

### Production

Run the worker:
```bash
npm run worker
```

### Running as a Service

For production, use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start worker
pm2 start workers/eddn-worker.js --name eddn-worker

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

## How It Works

1. **Connection**: Connects to EDDN relay at `tcp://eddn.edcd.io:9500`
2. **Filtering**: Monitors all market messages and filters for rare goods stations
3. **Caching**: Stores market data in `data/eddnMarketCache.json`
4. **Updates**: Cache is saved:
   - After 30 seconds of inactivity (debounced)
   - Every 5 minutes (periodic)
   - On graceful shutdown

## Cache File Structure

The cache file (`data/eddnMarketCache.json`) has this structure:

```json
{
  "_metadata": {
    "lastUpdated": "2026-01-12T12:00:00.000Z",
    "totalEntries": 10
  },
  "data": {
    "Lave|Lave Station": {
      "rare": "Lavian Brandy",
      "system": "Lave",
      "station": "Lave Station",
      "latest": {
        "timestamp": "2026-01-12T12:00:00.000Z",
        "stock": 0,
        "stockBracket": 0,
        "buyPrice": 0,
        "sellPrice": 0
      },
      "updates": [
        {
          "timestamp": "2026-01-12T12:00:00.000Z",
          "stock": 0,
          "stockBracket": 0,
          "buyPrice": 0,
          "sellPrice": 0
        }
      ]
    }
  }
}
```

## API Integration

The Astro API endpoint `/api/market-data` reads from this cache:

- `GET /api/market-data?system=Lave&station=Lave Station` - Get data for specific station
- `GET /api/market-data` - Get all market data

## Troubleshooting

### Worker won't start

1. **ZeroMQ not found**: Ensure ZeroMQ is installed on your system
2. **Port already in use**: Check if another instance is running
3. **Import errors**: Ensure TypeScript is compiled or use a JSON export

### No data in cache

1. **EDDN connection**: Check if worker is connected (look for connection messages)
2. **Rare stations**: Verify rare stations are being loaded correctly
3. **Message filtering**: EDDN messages may take time to arrive (depends on player activity)

### Data is stale

- Market data depends on players visiting stations and uploading via EDMC
- Rare goods stations may not be visited frequently
- Consider the data as "best available" rather than "real-time"

## Notes

- **Data Freshness**: Market data depends on player contributions via EDMC
- **Rare Goods**: Allocation is typically fixed per visit, not tracked as "stock"
- **BGS Effects**: Allocation can be affected by BGS states (Boom, Bust, etc.)
- **File-Based**: This is a simple file-based cache. For production, consider a database

## Future Improvements

- [ ] Add database support (PostgreSQL, MongoDB, Redis)
- [ ] Add data aggregation and statistics
- [ ] Add webhook notifications for data updates
- [ ] Add health check endpoint
- [ ] Add metrics and monitoring
