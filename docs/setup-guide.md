# ED Rare Router — Setup Guide

**Last updated:** March 1, 2026  
**Version:** 1.06.0-alpha

This guide walks you through first-run setup and configuration for ED Rare Router.

---

## Overview

On first run, the app requires a **config file** (`.config.json`) in the project root. Until it exists, visiting any page (except `/setup` and `/api/*`) redirects you to the **Setup** page. You can complete setup either in the browser or via the command line.

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — Included with Node.js

Optional (for EDDN real-time market data):

- **ZeroMQ** — See [EDDN Worker Setup](./eddn-worker-setup.md)

---

## Method 1: Web setup (recommended)

### Step 1: Install dependencies

From the project root:

```bash
npm install
```

### Step 2: Start the dev server

```bash
npm run dev
```

Open **http://localhost:4321** in your browser. You will be redirected to **/setup** because `.config.json` does not exist yet.

### Step 3: Fill out the setup form

| Field | Required | What to enter |
|-------|----------|----------------|
| **EDSM User-Agent** | Yes | A string that identifies your app and contact. Example: `ED-Rare-Router/1.0 (contact: your@email.com)` or `ED-Rare-Router/1.0 (contact: https://github.com/yourusername)`. EDSM uses this for API requests; no account needed. |
| **Data directory** | No | Leave blank to use the default `data/` folder in the project root. Or enter an absolute path (e.g. `C:\Users\You\data\ed-rare-router` or `/home/you/data/ed-rare-router`) to store caches and generated files elsewhere. |
| **EDSM API key** | No | Optional. Get from [EDSM](https://www.edsm.net/) (account → API). Improves rate limits; app works without it. |
| **EDDN API key** | No | Optional. Get from [EDDN](https://eddn.edcd.io/) (developers/API). Used for live market data; app works without it. |
| **Replace existing config** | — | Leave **unchecked** for first run. Check only when you already have `.config.json` and want to overwrite it. |

Click **Save config**. On success you are redirected to the home page. The file `.config.json` is created in the project root (gitignored).

### Step 4: Optional — generate initial data

After config is saved:

```bash
# Export rare goods to JSON (used by EDDN worker)
npm run export:rares

# Optional: fetch initial EDSM market data
npm run fetch:market
```

---

## Method 2: CLI setup

If you prefer the terminal:

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Run the setup script

```bash
npm run setup
```

Answer the prompts. The script creates `.config.json` in the project root.

### Step 3: Start the app

```bash
npm run dev
```

Open **http://localhost:4321**. You should see the main app (no redirect to setup).

### Step 4: Optional — generate initial data

Same as Method 1, Step 4:

```bash
npm run export:rares
npm run fetch:market   # optional
```

---

## Method 3: Manual config file

1. Copy the sample config:

   ```bash
   cp config.sample.json .config.json
   ```

2. Edit `.config.json` in a text editor:

   - **edsmUserAgent** — Set to your contact string (required for EDSM).
   - **dataDir** — Set to `null` or omit for default `data/`; or set to an absolute path string.
   - **apiKeys** — Optional. e.g. `"edsm": "your-key", "eddn": "your-key"`.

3. Save the file and run `npm run dev`.

---

## Config file reference

| Key | Type | Description |
|-----|------|-------------|
| `edsmUserAgent` | string | Sent as `User-Agent` to EDSM API. Include a contact (email or URL). |
| `dataDir` | string \| null | Absolute path to data directory. `null` or omit = `./data`. |
| `apiKeys` | object | Optional. Keys: `edsm`, `eddn`, etc. (lowercase). Values: API key strings. |

**Environment overrides:** You can override without editing `.config.json`:

- `EDSM_USER_AGENT` — Overrides `edsmUserAgent`.
- `EDSM_API_KEY`, `EDDN_API_KEY` — Override `apiKeys.edsm` and `apiKeys.eddn`.

---

## After setup

- **Data directory** — Cache files (system cache, rare systems cache, EDDN market cache, etc.) are stored under the configured data directory (default: `data/` in project root). The app creates the directory if it does not exist.
- **Changing config** — Edit `.config.json` by hand, or run the web setup again and check **Replace existing config** before saving.
- **First-run redirect** — Middleware in `src/middleware.ts` checks for `.config.json`. Once it exists, the redirect to `/setup` no longer occurs.

---

## Troubleshooting

- **"Config already exists"** — You already have `.config.json`. To replace it, use the web form and check **Replace existing config**, or edit/delete `.config.json` manually.
- **Redirect loop** — Ensure `.config.json` is in the **project root** (same folder as `package.json`) and is valid JSON.
- **Save fails** — Check that the process has write permission to the project root. On Windows, avoid paths that require admin rights.

For more help, see [Troubleshooting Notes](./troubleshooting-notes.md) and [Local Deployment Guide](./local-deployment.md).
