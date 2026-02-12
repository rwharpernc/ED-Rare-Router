# EDDN Worker Setup Guide

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

The EDDN worker service connects to EDDN (Elite Dangerous Data Network) via ZeroMQ and caches rare goods market data to a local file. This provides real-time market data updates as players visit stations and upload data via EDMC.

## Prerequisites

1. **ZeroMQ System Library** - Required for ZeroMQ support
   - **Windows**: Download from [zeromq.org](https://zeromq.org/download/) or use `vcpkg install zeromq`
   - **macOS**: `brew install zeromq`
   - **Linux (Debian/Ubuntu)**: `sudo apt-get install libzmq3-dev`
   - **Linux (Fedora)**: `sudo dnf install zeromq-devel`

2. **Node.js 18+** - Already required for the application

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

This installs the `zeromq` package.

### Step 2: Export Rare Goods Data

Generate the JSON file that the worker uses:

```bash
npm run export:rares
```

This creates `rares.json` in the data directory (default `data/` in the project root). If you use a custom path via `.config.json` (see main [README](../README.md#configuration)), the worker uses that `dataDir` as well.

## Usage

### Development Mode

Run the worker with auto-restart on file changes:

```bash
npm run worker:dev
```

### Production Mode

Run the worker:

```bash
npm run worker
```

## How It Works

1. **Connection**: Connects to EDDN relay at `tcp://eddn.edcd.io:9500`
2. **Filtering**: Monitors all market messages and filters for rare goods stations
3. **Caching**: Stores market data in the data directory (default `data/eddnMarketCache.json`; path can be overridden in `.config.json`)
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

## Running as a Service

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start worker
pm2 start npm --name "edrr-worker" -- run worker

# Save configuration
pm2 save

# View status
pm2 status

# View logs
pm2 logs edrr-worker

# Stop worker
pm2 stop edrr-worker

# Set to start on system boot
pm2 startup
```

### Using systemd (Linux)

Create `/etc/systemd/system/edrr-worker.service`:

```ini
[Unit]
Description=ED Rare Router EDDN Worker
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/ED-Rare-Router
ExecStart=/usr/bin/npm run worker
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable edrr-worker
sudo systemctl start edrr-worker
```

## Troubleshooting

### Worker Won't Start

**Error: "Cannot find module 'zeromq'"**
- Install ZeroMQ system library (see Prerequisites)
- Rebuild: `npm rebuild zeromq`

**Error: "rares.json not found"**
- Run: `npm run export:rares`

**Error: "ECONNREFUSED"**
- Check EDDN relay server status
- Verify network connectivity
- Check firewall settings

### No Data in Cache

**Cache file is empty or not updating:**
- Check worker logs for connection messages
- Verify EDDN relay is accessible
- Wait for players to visit stations (data depends on player activity)
- Check if rare stations are being filtered correctly

**Data is stale:**
- Market data depends on player contributions
- Rare goods stations may not be visited frequently
- Consider data as "best available" rather than "real-time"

### Performance Issues

**High CPU/Memory usage:**
- Worker processes all EDDN messages (high volume)
- Consider filtering more aggressively
- Normal usage: ~30-50 MB RAM, low CPU

## Data Freshness

- **Real-time**: Data arrives as players visit stations and upload via EDMC
- **Coverage**: Depends on player activity - rare goods stations visited less frequently
- **Reliability**: Data may be hours or days old for rarely-visited stations

## See Also

- [EDDN Integration](./eddn-integration-research.md) - EDDN overview
- [Local Deployment Guide](./local-deployment.md) - Complete deployment guide
- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Alternative data source
