# Local Deployment Guide

**ED Rare Router**  
Version: Beta 2
Last Updated: August 4, 2026

**Author:** R.W. Harper  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

## Overview

This guide covers running ED Rare Router as a local application on your own machine. Running it this way gets you persistent file storage, long-running processes, full control over the environment, and every feature available (nothing held back by serverless limitations).

## Architecture

For local deployment, you run:

1. **Astro Web Server** - Main application (port 4321)
2. **Bulk Fetch Script** (optional) - Periodic EDSM market data updates

```
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

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js

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
- All required packages

### Step 3: Optional – Local config

To use a custom data directory or set your EDSM contact (User-Agent), copy the sample config and edit (this file is not committed):

```bash
cp config.sample.json .config.json
# Edit .config.json: edsmUserAgent, and optionally dataDir (absolute path)
```

See the [Setup Guide](./setup-guide.md#config-file-reference) for the full field reference.

### Step 4: Optional - Fetch Initial Market Data

```bash
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

## Process Management

### Using PM2 (Recommended)

PM2 manages processes and auto-restarts on crashes. Build first - running `npm run dev` under PM2 would leave the dev-only `/curate` and `/curate-prices` routes live and defeat production optimizations:

```bash
# Install PM2 globally
npm install -g pm2

# Build the app
npm run build

# Start the built standalone server (defaults to port 8080 - set PORT to override)
PORT=4321 pm2 start dist/server/entry.mjs --name "edrr-web"

# Save configuration
pm2 save

# View status
pm2 status

# View logs
pm2 logs

# Stop the server
pm2 stop all

# Set to start on system boot
pm2 startup
```

### Using systemd (Linux)

Build the app first (`npm run build`), then create a service file that runs the built standalone server directly - not `npm run dev`, which would leave dev-only routes and verbose logging live:

**`/etc/systemd/system/edrr-web.service`:**
```ini
[Unit]
Description=ED Rare Router Web Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/ED-Rare-Router
ExecStart=/usr/bin/node dist/server/entry.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4321

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable edrr-web
sudo systemctl start edrr-web
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

For `npm run dev` and `npm run preview`, the default port is 4321. To change it, modify `astro.config.mjs`:

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change to your preferred port
  },
});
```

**Running the built server directly** (`node dist/server/entry.mjs` - the standalone Node adapter, used by PM2/systemd above) **ignores `astro.config.mjs`'s port setting entirely** and defaults to port 8080. Set the `PORT` (and optionally `HOST`) environment variable instead: `PORT=4321 node dist/server/entry.mjs`.

### Environment Variables

Create a `.env` file in the project root:

```env
# EDSM API User-Agent (optional)
EDSM_USER_AGENT=ED-Rare-Router/1.0 (contact: your-email@example.com)

# Node environment
NODE_ENV=production
```

## Data Files

The application uses these data files in the data directory (default `data/` in the project root, or the path set in `.config.json` as `dataDir`):

- `rareSystemsCache.json` - Rare origin system coordinates (optional, hand-built - see [Data Appendix](./data-appendix.md))
- `systemCache.json` - Cached EDSM system lookups (user-entered systems)
- `edsmMarketData.json` - Bulk-fetched EDSM market data (optional)
- `curatedLegality.json` - Manually curated legality overrides (dev only)
- `curatedPrices.json` - Manually curated baseline prices (dev only)

**Note**: These files are generated automatically and gitignored - don't commit them, they regenerate as needed.

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

### Data Files Not Updating

- Check file permissions
- Check logs for errors
- Ensure data directory exists and is writable

## Performance Considerations

### Resource Usage

- **Web Server**: ~50-100 MB RAM, minimal CPU
- **Disk Space**: ~1-5 MB for data files

### Optimization

- Use production build for better performance
- Enable HTTP caching headers
- Consider using a reverse proxy (nginx) for production

## Security Considerations

### Local Deployment

Since this runs locally, there's no external exposure unless you configure it, no authentication needed for local access, and you have full control over your data.

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
- `.config.json` and `.env` (if you have custom settings)
- `data/curatedLegality.json` and `data/curatedPrices.json` (if you've curated data)

## Updates

To update the application:

```bash
# Pull latest changes (if using git)
git pull

# Update dependencies
npm install

# Rebuild if needed
npm run build

# Restart the server
pm2 restart all
# or
systemctl restart edrr-web
```

## See Also

- [Bulk Market Data Fetch](./bulk-market-data-fetch.md) - Market data fetching
- [Testing Market Data Fetch](./testing-market-data-fetch.md) - Local testing
- [Deployment Guide](./deployment-guide.md) - General deployment info
