# EDDN Integration

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

ED Rare Router integrates with **EDDN (Elite Dangerous Data Network)** for real-time market data. EDDN is a community-driven real-time data distribution network that provides market data from players via tools like EDMC (Elite Dangerous Market Connector).

## What is EDDN?

**EDDN (Elite Dangerous Data Network)** is a community-driven real-time data distribution network for Elite Dangerous. It:

- Receives market data from players via tools like EDMC
- Distributes this data in real-time to subscribers
- Uses ZeroMQ (0MQ) for message distribution
- Provides JSON-formatted market data including commodity prices, stock levels, and allocations

### EDDN Data Flow

```
Player Game Client → EDMC → EDDN Relay → Subscribers (EDSM, Inara, ED Rare Router)
```

## Implementation

ED Rare Router uses a **file-based cache approach** for EDDN integration:

### Architecture

```
EDDN Relay (ZeroMQ) → Worker Service → File Cache (JSON) → API Endpoint → Frontend
```

1. **EDDN Worker Service** (`workers/eddn-worker.js`):
   - Connects to EDDN via ZeroMQ
   - Subscribes to all market messages
   - Filters for rare goods stations
   - Caches market data to `data/eddnMarketCache.json`

2. **Cache File** (`data/eddnMarketCache.json`):
   - JSON file with market data
   - Updated by worker service
   - Read by API endpoints

3. **API Endpoint** (`/api/market-data`):
   - Reads from cache file
   - Returns market data for rare goods
   - Includes metadata (last updated time)

## Setup

See the [EDDN Worker Setup Guide](./eddn-worker-setup.md) for complete setup instructions.

### Quick Start

1. **Install ZeroMQ** system library
2. **Export rare goods data**: `npm run export:rares`
3. **Start worker**: `npm run worker`

## Data Structure

EDDN market messages include:

```json
{
  "$schemaRef": "https://eddn.edcd.io/schemas/market/1",
  "header": {
    "uploaderID": "...",
    "softwareName": "EDMC",
    "softwareVersion": "...",
    "timestamp": "2026-01-12T12:00:00Z"
  },
  "message": {
    "systemName": "Lave",
    "stationName": "Lave Station",
    "marketId": 123456,
    "commodities": [
      {
        "name": "Lavian Brandy",
        "buyPrice": 0,
        "sellPrice": 0,
        "stock": 0,
        "stockBracket": 0,
        "demand": 0,
        "demandBracket": 0
      }
    ],
    "timestamp": "2026-01-12T12:00:00Z"
  }
}
```

## Rare Goods Allocation

**Important Distinction**:
- **Stock**: Traditional commodities have stock levels that change
- **Allocation**: Rare goods have a fixed allocation per visit (e.g., "1-5 tons per visit")
- **BGS Effects**: Allocation can be affected by BGS states (e.g., Boom, Bust)

**EDDN Limitation**: EDDN doesn't directly provide "allocation" - it provides stock data. For rare goods:
- Stock is typically 0 (always available to buy)
- Allocation is a game mechanic, not market data
- Need to infer from player reports or static data

## Alternative: Bulk EDSM Fetch

For systems where EDDN worker isn't available, ED Rare Router also supports bulk fetching from EDSM API:

- **Script**: `scripts/fetch-edsm-market-data.js`
- **Runs**: Every 12 hours (or on schedule)
- **Output**: `data/edsmMarketData.json`
- **API**: Falls back to this cache if EDDN data unavailable

See [Bulk Market Data Fetch](./bulk-market-data-fetch.md) for details.

## See Also

- [EDDN Worker Setup Guide](./eddn-worker-setup.md) - Complete setup instructions
- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - EDSM bulk fetch alternative
- [Local Deployment Guide](./local-deployment.md) - Running the application locally
