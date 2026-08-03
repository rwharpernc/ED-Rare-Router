# Developer Guide

**ED Rare Router**
Last Updated: August 3, 2026

**Author:** R.W. Harper
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

---

This guide is for building and running ED Rare Router from source - as a contributor, or if you want more control than the packaged build offers (see [Download & Run](../README.md#download--run-no-install) in the main README if you just want to use the app).

## Tech Stack

- **Astro** for server-side rendering and API routes
- **TypeScript** throughout
- **React** for the interactive UI components (islands)
- **TailwindCSS** for styling
- **EDSM API** as the external data source for system information

See the [Technical Design Document](./technical-design.md) for architecture details.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — comes with Node.js

## Getting Started

1. Clone the repository and go to the project root.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local config (first run only). Pick one:
   - **Web (recommended):** Run `npm run dev`, open http://localhost:4321 - you'll be redirected to **/setup**. Fill in at least **EDSM User-Agent** (e.g. `ED-Rare-Router/1.0 (contact: your@email.com)`), optionally a data directory and API keys, then click **Save config**.
   - **CLI:** Run `npm run setup` and follow the prompts to create `.config.json`.
   - **Manual:** Copy `config.sample.json` to `.config.json` and edit it directly.

   Field-by-field reference and troubleshooting: see the **[Setup Guide](./setup-guide.md)**.

## Running the Application

```bash
npm run dev
```

The app runs at `http://localhost:4321`. No separate "generate initial data" step is needed - caches build themselves from live EDSM lookups the first time they're needed.

### Production build

```bash
npm run build
npm run preview   # serves the production build locally
```

For running as a long-lived local service - process management with PM2 or systemd - see the **[Local Deployment Guide](./local-deployment.md)**. For a general deployment reference, see the **[Deployment Guide](./deployment-guide.md)**.

## npm Scripts

| Script | What it does |
|--------|---------------|
| `npm run dev` | Start the Astro dev server (hot reload, `/curate` and `/curate-prices` enabled) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run setup` | CLI first-run setup, writes `.config.json` |
| `npm run generate:rare-coords` | Fetch EDSM coordinates for all rare origin systems, writes `data/rare-system-coords.json` |
| `npm run update:rare-inara-links` | Fetch Inara's rare commodities page, fill in `inaraLink` fields in `rares.ts` |
| `npm run fetch:market` | Bulk-fetch EDSM market data for rare goods stations (optional; low success rate - see [EDSM Market Data Limitations](./edsm-market-data-limitations.md)) |
| `npm run package:win` / `package:linux` / `package:all` | Build the double-click distributable(s) for non-developers (see `scripts/package/build.mjs`) |

## Project Structure

```
/
  README.md
  CHANGELOG.md
  LICENSE
  config.sample.json    (copy to .config.json — not committed)
  astro.config.mjs
  docs/                  all documentation except README.md and CHANGELOG.md
  public/
    favicon.svg
  src/
    middleware.ts        first-run /setup redirect, gates dev-only routes in production
    pages/
      index.astro
      setup.astro
      curate.astro          (development only)
      curate-prices.astro   (development only)
      api/
        systems.ts
        system-lookup.ts
        rares-scan.ts
        market-data.ts
        cache-status.ts
        setup.ts
        setup-status.ts
        curated-legality.ts
        curated-prices.ts
    components/
      Layout.astro
      RaresPlannerIsland.tsx
      SystemInput.tsx
      PowerInput.tsx
      ResultsList.tsx
      CacheStatus.tsx
      LegalityCurator.tsx
      CuratorApp.tsx
      PriceCurator.tsx
      PriceCuratorApp.tsx
    data/
      rares.ts
      powers.ts
    lib/
      edsm.ts
      edsmMarket.ts
      edsmMarketCache.ts
      rareSystemsCache.ts
      distances.ts
      legality.ts
      powerplay.ts
      fuzzySearch.ts
      curatedLegality.ts
      curatedPrices.ts
      config.ts
    types/
      rares.ts
      edsm.ts
      api.ts
    styles/
      global.css
  scripts/                maintainer/dev tooling - not run by the app itself
    setup.js
    load-config.js
    generate-rare-coords.js
    update-rare-inara-links.js
    fetch-edsm-market-data.js
    start-local.bat / start-local.sh
    package/
      build.mjs           packaging build - produces the double-click distributable
      launcher.cjs         packaged app's launcher (compiled to an exe via pkg)
  data/                   runtime cache & config - gitignored contents, generated locally
```

## Development-only interfaces

Available under `npm run dev`, redirected away in production builds:

- **Legality curation** at `/curate` - manage `illegalInSuperpowers`, `illegalInGovs`, `illegalInSuperpowerGovs` overrides
- **Price curation** at `/curate-prices` - manage curated baseline purchase prices
- **Cache status** display shows when each data file was last updated
- Console logging is fairly verbose to help with debugging

## Keeping the repo clean

The repo stays free of local machine data and logs. Don't commit:

- **Data and caches** – anything under `data/` other than `data/.gitkeep` (e.g. `systemCache.json`, `edsmMarketData.json`, other JSON caches) is generated locally and ignored.
- **Config and secrets** – `.config.json`, `.env`, and anything holding API keys or local paths.
- **Logs** – `*.log` and `logs/` are ignored.
- **Packaging output** – `.cache/` and `package-out/` (see `scripts/package/build.mjs`) are ignored.

See `.gitignore` for the full list.

## Where to go next

- **[Setup Guide](./setup-guide.md)** — first-run setup (web, CLI, manual), field-by-field config reference
- **[Local Deployment Guide](./local-deployment.md)** — running locally, process management
- **[Deployment Guide](./deployment-guide.md)** — deployment reference
- **[Technical Design](./technical-design.md)** — architecture and design decisions
- **[Architecture Overview](./architecture-overview.md)** — system architecture and data flow
- **[API Documentation](./api-documentation.md)** — API endpoint specifications
- **[Data Appendix](./data-appendix.md)** — data structures and static datasets
- **[Tools](./tools/)** — rare commodity curation ([curation guide](./tools/rare-commodity-curation-guide.md)) and route-finder design ([route finder](./tools/rare-commodity-route-finder.md))
- **[TODO](./TODO.md)** — planned improvements and known gaps
- **[Documentation Index](./README.md)** — everything else
