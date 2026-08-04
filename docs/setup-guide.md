# ED Rare Router — Setup Guide

**Last updated:** August 4, 2026  
**Version:** Beta 2

This guide walks you through first-run setup and configuration for ED Rare Router.

---

## Overview

On first run, the app requires a **config file** (`.config.json`) in the project root. Until it exists, visiting any page (except `/setup` and `/api/*`) redirects you to the **Setup** page. You can complete setup either in the browser or via the command line.

**Not a developer?** You don't need any of this. Download the packaged build instead - see [Download & Run (no install)](../README.md#download--run-no-install) in the main README. It bundles its own Node.js runtime and still walks you through the same in-browser setup form described below; you just skip `npm install` and the terminal entirely. The methods below (web, CLI, manual) are for running from source.

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — Included with Node.js

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
| **EDSM User-Agent** | No (recommended) | A string that identifies your app and contact. Example: `ED-Rare-Router/1.0 (contact: your@email.com)` or `ED-Rare-Router/1.0 (contact: https://github.com/yourusername)`. EDSM uses this for API requests; no account needed. Leave blank and a generic default is used instead. |
| **Data directory** | No | Leave blank to use the default `data/` folder in the project root. Or enter an absolute path (e.g. `C:\Users\You\data\ed-rare-router` or `/home/you/data/ed-rare-router`) to store caches and generated files elsewhere. |
| **EDSM API key** | No | Optional. Get from [EDSM](https://www.edsm.net/) (account → API). Improves rate limits; app works without it. |
| **Replace existing config** | — | Leave **unchecked** for first run. Check only when you already have `.config.json` and want to overwrite it. |

Click **Save config**. On success you are redirected to the home page. The file `.config.json` is created in the project root (gitignored). No further setup is needed - caches build themselves from live EDSM lookups the first time they're needed.

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

---

## Method 3: Manual config file

1. Copy the sample config:

   ```bash
   cp config.sample.json .config.json
   ```

2. Edit `.config.json` in a text editor:

   - **edsmUserAgent** — Set to your contact string (required for EDSM).
   - **dataDir** — Set to `null` or omit for default `data/`; or set to an absolute path string.
   - **apiKeys** — Optional. e.g. `"edsm": "your-key"`.

3. Save the file and run `npm run dev`.

---

## Config file reference

| Key | Type | Description |
|-----|------|-------------|
| `edsmUserAgent` | string | Sent as `User-Agent` to EDSM API. Include a contact (email or URL). |
| `dataDir` | string \| null | Absolute path to data directory. `null` or omit = `./data`. |
| `apiKeys` | object | Optional. Keys: `edsm`, etc. (lowercase). Values: API key strings. |

**Environment overrides:** You can override without editing `.config.json`:

- `EDSM_USER_AGENT` — Overrides `edsmUserAgent`.
- `EDSM_API_KEY` — Overrides `apiKeys.edsm`.

---

## After setup

- **Data directory** — Cache files (system cache, rare systems cache, etc.) are stored under the configured data directory (default: `data/` in project root). The app creates the directory if it does not exist.
- **Changing config** — Edit `.config.json` by hand, or run the web setup again and check **Replace existing config** before saving.
- **First-run redirect** — Middleware in `src/middleware.ts` checks for `.config.json`. Once it exists, the redirect to `/setup` no longer occurs.

---

## Troubleshooting

- **"Config already exists"** — You already have `.config.json`. To replace it, use the web form and check **Replace existing config**, or edit/delete `.config.json` manually.
- **Redirect loop** — Ensure `.config.json` is in the **project root** (same folder as `package.json`) and is valid JSON.
- **Save fails** — Check that the process has write permission to the project root. On Windows, avoid paths that require admin rights.

For more help, see [Troubleshooting Notes](./troubleshooting-notes.md) and [Local Deployment Guide](./local-deployment.md).
