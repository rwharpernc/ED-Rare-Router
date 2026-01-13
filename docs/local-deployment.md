# Local Deployment Guide

**ED Rare Router**  
Version: unstable v1.4 (Unreleased)  
Last Updated: January 13, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

## Overview

This guide covers running ED Rare Router as a **local application** on your own machine. This approach enables:

- ✅ EDDN worker service for real-time market data
- ✅ Persistent file storage
- ✅ Long-running processes
- ✅ Full control over the environment
- ✅ All features available (no serverless limitations)

## Architecture

For local deployment, you can run:

1. **Astro Web Server** - Main application (port 4321)
2. **EDDN Worker Service** (optional) - Real-time market data via ZeroMQ
3. **Bulk Fetch Script** (optional) - Periodic EDSM market data updates

```
┌─────────────────┐
│  EDDN Worker    │ → data/eddnMarketCache.json
│  (ZeroMQ)       │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  Astro Server   │ → Reads from cache files
│  (Port 4321)    │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│   Web Browser   │
└─────────────────┘
```

## Prerequisites

### Required

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js

### Optional (for EDDN Worker)

- **ZeroMQ** - Required for EDDN worker service
  - **Windows**: Download from [zeromq.org](https://zeromq.org/download/) or use `vcpkg install zeromq`
  - **macOS**: `brew install zeromq`
  - **Linux**: `sudo apt-get install libzmq3-dev` (Debian/Ubuntu)

## Installation

### Step 1: Clone/Download Project

```bash
# If using git
git clone <repository-url>
cd ED-Rare-Router

# Or extract downloaded archive
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Astro and React dependencies
- ZeroMQ (if available)
- All required packages

### Step 3: Generate Initial Data Files

```bash
# Export rare goods to JSON (for EDDN worker)
npm run export:rares

# Fetch initial market data from EDSM (optional)
npm run fetch:market
```

## Running the Application

### Option 1: Development Mode (Recommended)

Run the Astro dev server:

```bash
npm run dev
```

The application will be available at: `http://localhost:4321`

**Features:**
- Hot reload on file changes
- Development tools enabled
- Curation interface available at `/curate`

### Option 2: Production Build

Build and run production version:

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

Production build will be available at: `http://localhost:4321`

## Running EDDN Worker (Optional)

For real-time market data, run the EDDN worker service:

### Start Worker

```bash
npm run worker
```

Or with auto-restart on file changes:

```bash
npm run worker:dev
```

The worker will:
- Connect to EDDN via ZeroMQ
- Filter market messages for rare goods stations
- Cache data to `data/eddnMarketCache.json`
- Update automatically as players upload data

### Running Both Services

You'll need two terminal windows:

**Terminal 1 - Web Server:**
```bash
npm run dev
```

**Terminal 2 - EDDN Worker:**
```bash
npm run worker
```

## Process Management

### Using PM2 (Recommended)

PM2 manages processes and auto-restarts on crashes:

```bash
# Install PM2 globally
npm install -g pm2

# Start web server
pm2 start npm --name "edrr-web" -- run dev

# Start EDDN worker
pm2 start npm --name "edrr-worker" -- run worker

# Save configuration
pm2 save

# View status
pm2 status

# View logs
pm2 logs

# Stop services
pm2 stop all

# Set to start on system boot
pm2 startup
```

### Using systemd (Linux)

Create service files for systemd:

**`/etc/systemd/system/edrr-web.service`:**
```ini
[Unit]
Description=ED Rare Router Web Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/ED-Rare-Router
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**`/etc/systemd/system/edrr-worker.service`:**
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
sudo systemctl enable edrr-web edrr-worker
sudo systemctl start edrr-web edrr-worker
```

## Scheduled Tasks

### Bulk Market Data Fetch

Set up a cron job or scheduled task to run the bulk fetch every 12 hours:

**Linux/macOS (crontab):**
```bash
crontab -e

# Add this line (runs every 12 hours)
0 */12 * * * cd /path/to/ED-Rare-Router && npm run fetch:market
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "Daily" → "Repeat task every: 12 hours"
4. Action: Start a program
5. Program: `npm`
6. Arguments: `run fetch:market`
7. Start in: `C:\path\to\ED-Rare-Router`

## Configuration

### Port Configuration

Default port is 4321. To change it, modify `astro.config.mjs`:

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change to your preferred port
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

## Data Files

The application uses these data files (in `data/` directory):

- `rareSystemsCache.json` - Pre-fetched rare origin system coordinates
- `systemCache.json` - Cached EDSM system lookups (user-entered systems)
- `edsmMarketData.json` - Bulk-fetched EDSM market data (optional)
- `eddnMarketCache.json` - Real-time EDDN market data (if worker running)
- `curatedLegality.json` - Manually curated legality overrides (dev only)

**Note**: These files are generated automatically. You can commit them to git or regenerate as needed.

## Accessing the Application

Once running, access the application at:

- **Main Application**: `http://localhost:4321`
- **Curation Interface** (dev only): `http://localhost:4321/curate`

## Network Access

### Local Network Access

To access from other devices on your network:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/macOS
   ifconfig
   ```

2. Update Astro config to listen on all interfaces:
   ```javascript
   export default defineConfig({
     server: {
       host: true, // Listen on all interfaces
       port: 4321,
     },
   });
   ```

3. Access from other devices: `http://YOUR-IP:4321`

### Firewall Configuration

You may need to allow the port through your firewall:

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "ED Rare Router" -Direction Inbound -LocalPort 4321 -Protocol TCP -Action Allow
```

**Linux (ufw):**
```bash
sudo ufw allow 4321/tcp
```

**macOS:**
System Preferences → Security & Privacy → Firewall → Firewall Options → Add Application

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

### EDDN Worker Won't Start

**Error: "Cannot find module 'zeromq'"**
- Install ZeroMQ system library (see Prerequisites)
- Rebuild: `npm rebuild zeromq`

**Error: "ECONNREFUSED"**
- Check EDDN relay server status
- Verify network connectivity
- Check firewall settings

### Data Files Not Updating

- Check file permissions
- Verify worker is running (if using EDDN)
- Check logs for errors
- Ensure data directory exists and is writable

## Performance Considerations

### Resource Usage

- **Web Server**: ~50-100 MB RAM, minimal CPU
- **EDDN Worker**: ~30-50 MB RAM, low CPU (mostly idle)
- **Disk Space**: ~1-5 MB for data files

### Optimization

- Use production build for better performance
- Enable HTTP caching headers
- Consider using a reverse proxy (nginx) for production

## Security Considerations

### Local Deployment

Since this runs locally:
- ✅ No external exposure (unless you configure it)
- ✅ No authentication needed (local access only)
- ✅ Full control over data

### If Exposing to Network

If you expose to your local network:
- Consider adding authentication
- Use HTTPS if possible (reverse proxy with Let's Encrypt)
- Keep software updated
- Restrict firewall rules

## Backup

### Data Files

Back up the `data/` directory regularly:

```bash
# Simple backup script
tar -czf edrr-backup-$(date +%Y%m%d).tar.gz data/
```

### Configuration

Back up:
- `data/` directory (all cache files)
- `.env` file (if you have custom settings)
- `data/curatedLegality.json` (if you've curated data)

## Updates

To update the application:

```bash
# Pull latest changes (if using git)
git pull

# Update dependencies
npm install

# Rebuild if needed
npm run build

# Restart services
pm2 restart all
# or
systemctl restart edrr-web edrr-worker
```

## See Also

- [EDDN Worker Setup Guide](./eddn-worker-setup.md) - EDDN worker details
- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Market data fetching
- [Testing Market Data Fetch](./testing-market-data-fetch.md) - Local testing
- [Deployment Guide](./deployment-guide.md) - General deployment info
