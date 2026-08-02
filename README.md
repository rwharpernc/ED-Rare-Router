# ED Rare Router

A standalone web app for Elite Dangerous players planning rare goods trading routes, with PowerPlay integration.

## Version

**Current Version**: Alpha 1.06 (March 1, 2026)

This version ships a dataset of roughly 140-142 rare commodities (the exact count is still being verified), a legality system with detailed restrictions, a manual curation interface for development, first-run setup via web or CLI, and updated documentation. Rare commodity data is static - route planning itself is manual, based on your scan results.

## ⚠️ Important Disclaimers

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

**NO WARRANTIES OR GUARANTEES ARE PROVIDED**

This project is:
- A personal hobby project, not a commercial product
- Actively in development - still in the design and prototyping phase
- Not ready for production, Alpha, or Beta testing
- Subject to frequent refactors and breaking changes

By using this software, you acknowledge that:
- It's provided "AS IS" without warranty of any kind
- No guarantees are made about accuracy, reliability, or fitness for any purpose
- You assume all risk associated with using it
- The author and contributors aren't liable for damages arising from its use

A few practical notes: refactors happen often, documentation is kept reasonably current, the code is commented, and features can be incomplete or change significantly without notice.

This software is licensed under the GNU General Public License v3.0, which includes its own warranty disclaimers. See [LICENSE](./LICENSE) for the full text.

## Overview

ED Rare Router helps commanders:
- Scan for rare goods near their current location
- Find where rare goods originate and calculate distance from their current system
- Check legality of rare goods across different systems, with restriction details
- See which governments allow or disallow each item
- Build routes manually from scan results (the data is static, so nothing needs updating)

## Features

### Core
- **Quick Scan** - one button scans for all rare goods near your current system
- Roughly 140-142 rare commodities covering the major rare goods in Elite Dangerous (count still being verified)
- System autocomplete backed by the EDSM API, with caching so repeat lookups are fast
- Lightyear distance calculations between systems
- Results sort closest-first, with unknown systems pushed to the end

### Legality
- Three-state legality display: Always Legal, Always Illegal, or Conditional
- Shows which governments and superpowers allow or disallow each item
- Handles combined restrictions, e.g. superpower + government pairs like "Federal Democracy"
- Click to expand full legality details for any item

### PowerPlay
- Fuzzy search for PowerPlay powers, with faction badges
- Finance Ethos is detected automatically from your selected power
- Effective CP divisors are shown with Finance Ethos applied

### Interface
- Vertical layout - selector panel above results at any screen size
- Optional pagination by distance, with nine page-size options (25-1000 ly)
- Each result shows pad size, cost, permit requirements, and legality
- "Back to top" button at the end of the results list
- Live buy/sell prices and stock levels from EDDN, when the worker is running
- Price display falls back gracefully:
  - "(Live)" for real-time EDDN market data
  - "(Est.)" for curated baseline prices or static costs
  - Stock and sell price shown when available

### Data & performance
- All rare commodity data is static - locations don't change, so there's nothing to keep in sync
- System coordinates and market data are cached locally
- Route planning stays manual - you build routes from scan results yourself
- EDDN integration is optional and adds real-time market data via a separate worker service

### Development tools
- Manual data curation interfaces, development mode only:
  - Legality curation at `/curate`
  - Price curation at `/curate-prices`
- Cache status display shows when data was last updated
- Console logging is fairly verbose to help with debugging

See the [API Documentation](./docs/api-documentation.md) and [Technical Design Document](./docs/technical-design.md) for the full feature writeup.

## Tech Stack

- **Astro** for server-side rendering and API routes
- **TypeScript** throughout
- **React** for the interactive UI components (islands)
- **TailwindCSS** for styling
- **EDSM API** as the external data source for system information

See the [Technical Design Document](./docs/technical-design.md) for architecture details.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — comes with Node.js

**Optional, for the EDDN worker (real-time market data):**

- **ZeroMQ**
  - **Windows:** [zeromq.org](https://zeromq.org/download/) or `vcpkg install zeromq`
  - **macOS:** `brew install zeromq`
  - **Linux (Debian/Ubuntu):** `sudo apt-get install libzmq3-dev`
  - **Linux (Fedora):** `sudo dnf install zeromq-devel`

See [EDDN Worker Setup](./docs/eddn-worker-setup.md) for details.

## Installation and first-run setup

For step-by-step instructions, see the **[Setup Guide](./docs/setup-guide.md)**.

### Quick start

1. Clone the repository and go to the project root.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local config (first run only). Pick one:
   - **Web (recommended):** Run `npm run dev`, open http://localhost:4321 - you'll be redirected to **/setup**. Fill in at least **EDSM User-Agent** (e.g. `ED-Rare-Router/1.0 (contact: your@email.com)`), optionally a data directory and API keys, then click **Save config**.
   - **CLI:** Run `npm run setup` and follow the prompts to create `.config.json`.
   - **Manual:** Copy `config.sample.json` to `.config.json` and edit it directly (set `edsmUserAgent` and optionally `dataDir`, `apiKeys`).

4. Optional - generate initial data:
   ```bash
   npm run export:rares
   npm run fetch:market   # optional
   ```

## Running the Application

### Basic usage (web server only)

```bash
npm run dev
```

The app runs at `http://localhost:4321`.

### With the EDDN worker (real-time market data)

Run both services, in separate terminals:

**Terminal 1 - web server:**
```bash
npm run dev
```

**Terminal 2 - EDDN worker:**
```bash
npm run worker
```

The worker connects to EDDN over ZeroMQ and caches market data to `data/eddnMarketCache.json`.

### Production build

```bash
npm run build
```

Preview it with:

```bash
npm run preview
```

For production deployment - process management with PM2 or systemd, running as a service - see the [Local Deployment Guide](./docs/local-deployment.md).

## Deployment

### Local deployment (recommended)

This app is meant to run locally on your own machine. That gets you:
- The EDDN worker service for real-time market data
- Persistent file storage
- Full control over the environment
- No serverless limitations to work around

**Quick start (local):**
1. `npm install`
2. `npm run export:rares` to generate initial data
3. `npm run dev` to start the app
4. Open `http://localhost:4321`

**Optional - start the EDDN worker:**
- Install ZeroMQ (see the [Local Deployment Guide](./docs/local-deployment.md))
- Run `npm run worker` in a separate terminal

See the [Local Deployment Guide](./docs/local-deployment.md) for the full walkthrough.

## Documentation

**Last updated:** March 1, 2026 · **Version:** 1.06.0-alpha

### Root

- **[CHANGELOG.md](./CHANGELOG.md)** — version history and changes

### Setup and deployment

- **[Setup Guide](./docs/setup-guide.md)** — first-run setup (web, CLI, manual), field-by-field config reference
- **[Local Deployment Guide](./docs/local-deployment.md)** — running locally, process management, EDDN worker
- **[Deployment Guide](./docs/deployment-guide.md)** — deployment reference
- **[EDDN Worker Setup](./docs/eddn-worker-setup.md)** — ZeroMQ and EDDN worker configuration

### Technical (`/docs`)

- **[Documentation Index](./docs/README.md)** — overview of all documentation
- **[Technical Design](./docs/technical-design.md)** — architecture and design decisions
- **[API Documentation](./docs/api-documentation.md)** — API endpoint specifications
- **[Architecture Overview](./docs/architecture-overview.md)** — system architecture and data flow
- **[Data Appendix](./docs/data-appendix.md)** — data structures and static datasets
- **[Tools](./docs/tools/)** — rare commodity curation and route-finder design ([curation guide](./docs/tools/rare-commodity-curation-guide.md), [route finder](./docs/tools/rare-commodity-route-finder.md))

Only `README.md` and `CHANGELOG.md` live at the repo root - everything else is under `/docs`.

## Configuration

Local settings come from **`.config.json`** in the project root. This file isn't committed to the repo.

- Copy **`config.sample.json`** to **`.config.json`** and edit as needed.
- **`edsmUserAgent`** – used when calling the EDSM API (and in the market fetch script). Use a contact email or URL you're comfortable sharing with EDSM; keep personal details only in your local `.config.json`.
- **`dataDir`** – optional. Set an absolute path to store cache and data files elsewhere - useful if you want to avoid committing paths or share a data directory. Leave `null` to use the default `data/` folder.
- **`apiKeys`** – one place for all API keys. Use lowercase names, e.g. `"edsm": "your-key"`, `"eddn": "..."`. The app reads them via `getApiKey("edsm")`, etc. Environment variables override these: set `EDSM_API_KEY`, `EDDN_API_KEY` (uppercase name + `_API_KEY`) for CI or deployment.

Without a `.config.json`, the app falls back to defaults - a generic User-Agent and the `data/` folder under the project root.

### First-run setup

If there's no `.config.json`, the app redirects to **/setup** so you can enter your EDSM User-Agent, an optional data directory, and API keys - the form writes `.config.json` for you. You can also run `npm run setup` in the terminal, or copy and edit `config.sample.json` by hand. Full details are in the **[Setup Guide](./docs/setup-guide.md)**.

### Keeping the repo clean

The repo stays free of local machine data and logs. Don't commit:

- **Data and caches** – anything under `data/` other than `data/.gitkeep` (e.g. `rares.json`, `edsmMarketData.json`, other JSON caches) is generated locally and ignored.
- **Config and secrets** – `.config.json`, `.env`, and anything holding API keys or local paths.
- **Logs** – `*.log` and `logs/` are ignored.

After cloning, generate data with `npm run export:rares` and, optionally, `npm run fetch:market`. See `.gitignore` for the full list.

## Project Structure

```
/
  README.md
  CHANGELOG.md
  config.sample.json   (copy to .config.json — not committed)
  docs/
  src/
    pages/
      index.astro
      api/
        systems.ts
        rares-scan.ts
        system-lookup.ts
    components/
      Layout.astro
      RaresPlannerIsland.tsx
      SystemInput.tsx
      PowerInput.tsx
      ResultsList.tsx
      LegalityCurator.tsx
      CuratorApp.tsx
    data/
      rares.ts
      powers.ts
    lib/
      edsm.ts
      rareSystemsCache.ts
      distances.ts
      legality.ts
      powerplay.ts
      fuzzySearch.ts
      curatedLegality.ts
    pages/
      curate.astro (development only)
    types/
      rares.ts
      edsm.ts
      api.ts
  scripts/
  data/
    rareSystemsCache.json (generated)
    systemCache.json (generated)
    curatedLegality.json (generated, development only)
  styles/
    global.css
```

## How to Use

### Basic usage

1. **Enter your current system** - the autocomplete helps you find the right name.

2. **Select your pledged power (optional)** - Finance Ethos is detected automatically from your power selection. If it applies, you'll see a green message showing the CP divisor reduction. Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval.

3. **Click "Scan Nearby Rares"** - the app calculates distance and legality for all rare commodities (140-142, count still being verified).

### Reading results

Results sort by distance, closest first. Each entry shows:
- Distance from your current system to the rare's origin
- Legality at your current system:
  - **Green "Legal"** = legal everywhere
  - **Red "Illegal"** = illegal everywhere
  - **Yellow "Conditional"** = legal in some systems, illegal in others (click to see which)
- Pad size, cost, permit requirements, and other details

A "Back to top" button appears at the end of the list.

### Pagination

All results show by default. Turn on "Paginate by Distance" to break results into distance ranges - pick from nine page sizes: 25, 50, 75, 100, 150, 200, 250, 500, or 1000 light years. Useful when a scan returns a lot of results and you want to focus on a specific range.

### Finance Ethos

Finance Ethos is detected automatically from your selected power - there's no checkbox to toggle. Pick a power that has it, and a green confirmation message appears. Powers with Finance Ethos:
- Denton Patreus (Empire)
- Jerome Archer (Federation)
- Li Yong-Rui (Independent)
- Zemina Torval (Empire)

## Author

**R.W. Harper**

- LinkedIn: [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)

## License

Licensed under the GNU General Public License v3.0.

This license includes warranty disclaimers - the software is provided "AS IS" without warranty of any kind, express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and noninfringement.

See [LICENSE](./LICENSE) for the full text, or visit [gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html) for more on GPL v3.0.
