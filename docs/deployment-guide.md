# Deployment Guide

**ED Rare Router**  
Version: unstable v1.4 (Unreleased)  
Last Updated: February 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding deployment, availability, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

## Overview

ED Rare Router is designed to run as a **local application** on your own machine. This guide covers local deployment and setup.

For detailed local deployment instructions, see the [Local Deployment Guide](./local-deployment.md).

## Quick Start

### Basic Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate initial data**:
   ```bash
   npm run export:rares
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open `http://localhost:4321` in your browser

### With EDDN Worker (Real-time Market Data)

1. **Install ZeroMQ** (see [EDDN Worker Setup Guide](./eddn-worker-setup.md))

2. **Start web server** (Terminal 1):
   ```bash
   npm run dev
   ```

3. **Start EDDN worker** (Terminal 2):
   ```bash
   npm run worker
   ```

## Production Deployment

For production use, see the [Local Deployment Guide](./local-deployment.md) which covers:
- Process management (PM2, systemd)
- Running as a service
- Network access configuration
- Scheduled tasks
- Security considerations

## Build for Production

Build the production version:

```bash
npm run build
npm run preview
```

## Data Files

The application uses these data files in the data directory (default `data/`; override with `dataDir` in `.config.json`):

- `rareSystemsCache.json` - Pre-fetched rare origin system coordinates
- `systemCache.json` - Cached EDSM system lookups
- `edsmMarketData.json` - Bulk-fetched EDSM market data
- `eddnMarketCache.json` - Real-time EDDN market data (if worker running)
- `rares.json` - Rare goods data export (for worker)
- `curatedLegality.json` - Manually curated legality overrides (dev only)

These files are generated automatically and can be committed to your repository.

## Configuration

### Local config (paths and EDSM contact)

Optional local settings are read from **`.config.json`** in the project root (not committed). Copy **`config.sample.json`** to **`.config.json`** and edit:

- **`edsmUserAgent`** – User-Agent string for EDSM API and fetch script (e.g. include your contact email here so it is not stored in the repo).
- **`dataDir`** – Optional absolute path for cache and data files. Omit or set to `null` to use the default `data/` directory.
- **`apiKeys`** – Object for all API keys (e.g. `"edsm"`, `"eddn"`). Env overrides: `EDSM_API_KEY`, `EDDN_API_KEY`, etc.

See the main [README](../README.md#configuration) for details.

### Port Configuration

Default port is 4321. To change it, modify `astro.config.mjs`:

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change to your preferred port
    host: true, // Listen on all interfaces (for network access)
  },
});
```

### Environment Variables

Create a `.env` file in the project root:

```env
# EDSM API User-Agent (optional)
EDSM_USER_AGENT=ED-Rare-Router/1.0 (contact: your-email@example.com)

# Node environment
NODE_ENV=production
```

## Troubleshooting

### Port Already in Use

**Error: "Port 4321 is already in use"**

```bash
# Find process using port
# Windows
netstat -ano | findstr :4321

# Linux/macOS
lsof -i :4321

# Kill the process or change port in config
```

### Build Errors

- **"No adapter installed"**: The Node adapter is already configured in `astro.config.mjs`
- **"POST requests not available"**: Ensure `output: 'server'` is set in config

### Runtime Errors

- **API endpoints return 404**: Verify the build completed successfully
- **CORS errors**: Check that your API routes are properly configured

## See Also

- [Local Deployment Guide](./local-deployment.md) - Complete local deployment guide
- [EDDN Worker Setup Guide](./eddn-worker-setup.md) - EDDN worker configuration
- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Market data fetching
- [Testing Market Data Fetch](./testing-market-data-fetch.md) - Testing instructions
