# Changelog

All notable changes to this project are documented here.

**Author:** R.W. Harper
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees are given, and the author and contributors aren't liable for damages arising from its use. See [LICENSE](../LICENSE) for full terms.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Versioning uses three tiers - alpha/unstable, beta, and release. Current release: **Alpha 1.06** (March 1, 2026).

## Versioning System

- **unstable** – development versions, active changes, possible breaking changes
- **beta** – feature-complete, undergoing testing and refinement
- **release** – stable, production-ready

## [Alpha 1.06] - 2026-03-01

### Added
- Setup guide with detailed first-run instructions (web and CLI, field-by-field) in `docs/setup-guide.md`
- Setup guide and tools docs linked from `docs/README.md`
- `generate:rare-coords` and `update:rare-inara-links` scripts, ported from Waystation, with docs in `docs/tools/`

### Changed
- Docs updated for March 1, 2026 / version 1.06.0-alpha, with an expanded README setup section
- Added JSDoc and inline comments to `src/lib/config.ts`, `src/middleware.ts`, the setup API/page, and other key modules
- Credit line simplified to R.W. Harper only

### Fixed
- Moved first-run and dev-only redirects into middleware so they happen before any response streams, fixing a `ResponseSentError`

## [Alpha 1.05] - 2026-02-12

### Added
- Optional `.config.json` (gitignored) holding paths and secrets, copied from `config.sample.json`
  - `edsmUserAgent` for EDSM API contact info (keeps personal email out of the repo)
  - `dataDir` to optionally override the cache/data directory
  - `apiKeys` object for all API keys (e.g. `edsm`, `eddn`), overridable via `EDSM_API_KEY`, `EDDN_API_KEY`, etc.
- Config loaders: `src/lib/config.ts` for the app, `scripts/load-config.js` for scripts/worker, exposing `getDataDir()`, `getEdsmUserAgent()`, `getApiKey(name)`
- First-run setup: redirects to `/setup` when no `.config.json` exists; also available via `npm run setup` for interactive CLI prompts
- Expanded `.gitignore` for data, logs, and local artifacts - generated data JSON files are no longer committed

### Changed
- All data/cache paths now go through `getDataDir()` (defaults to `data/` in the project root)
- EDSM User-Agent now comes from config/env instead of a hardcoded value
- Docs updated to Alpha 1.05 / February 12, 2026, covering config, setup, and API keys

## [unstable v1.4] - 2026-01-13

### Added
- Price curation system for baseline purchase prices (development mode only)
  - `/curate-prices` page and `GET`/`POST`/`DELETE /api/curated-prices` endpoints
  - Price fallback chain: EDDN live data → curated prices → static costs → N/A
  - Scan results show source indicators (Live/Est.), plus stock and sell price when EDDN has them
- EDDN market data integration - live buy/sell prices and stock, with automatic cache updates as data arrives
  - EDDN cache reader handles the nested response structure
  - Migrated to the ZeroMQ v6 API, with zlib decompression for EDDN messages
- Troubleshooting notes document covering the 140-vs-142 rare count discrepancy, EDDN market data limitations, price display priority, the cache-status API fix, the ZeroMQ v6 migration, and the nested cache structure fix
- Fixed a missing `existsSync` import in the cache-status API
- Return links on curation pages, plus temporary curation buttons in the footer (dev mode only)
- EDDN worker: better logging and error handling, progress messages with time estimates, clearer errors for missing market data, and a longer 2-second API delay to be more polite to EDSM

### Changed
- Rare commodity count now documented as "140-142 (still being verified)" everywhere, replacing the old fixed "142", with notes on the discrepancy
- General documentation cleanup: removed Netlify-specific docs and workarounds, focused the deployment guide on local deployment, updated EDDN integration docs to match the current implementation, dropped serverless references from the technical docs, documented the market-data API endpoint, and reorganized the docs index

### Removed
- Netlify support: `@astrojs/netlify` dependency, `astro.config.netlify.mjs`, `netlify.toml`, and the unused `start:local` script reference
- `src/lib/eddnCache.ts`, replaced by `edsmMarketCache.ts`; `package.json` now only lists dependencies needed for local deployment

## [unstable v1.4] - 2026-01-12

### Added
- Enhanced legality system: combined superpower + government restrictions (e.g. "Federal Democracy"), detailed explanations of which governments allow or disallow each item, a three-state display (Always Legal / Always Illegal / Conditional), and an expandable "Legality Details" section per item. A disclaimer notes the data is still being validated.
- Legality curation system (development mode only): `/curate` page, `/api/curated-legality` read/write endpoints, curated data stored in `data/curatedLegality.json` and layered over base data, with search/filter and visual indicators for curated vs. base entries
- `docs/legality-categories.md` - reference guide for alcohol/liquor, narcotics, tobacco, and weapons legality patterns
- `docs/data-accuracy-notes.md` - guide for curating legality data from Inara.cz, with example translations
- "Prison" added as a government type alongside "Prison Colony" (for Detention Centres, which are facilities rather than full systems), available in the curation UI
- Disclaimers added throughout README.md, CHANGELOG.md, TODO.md, and all `docs/*.md` files, noting this is a development/hobby project used at your own risk, with GPL v3.0 references

### Changed
- Layout changed from side-by-side to vertical - the configuration panel now sits above results at every screen size, and the responsive two-column grid is gone
- Legality data structure gained an `illegalInSuperpowerGovs` field for combined restrictions; updated accordingly for the alcohol/liquor group (Lavian Brandy, Centauri Mega Gin, Eranin Pearl Whisky, Kongga Ale), narcotics (Onionhead variants, Lyrae Weed, Tarach Spice), and tobacco (Kamitra Cigars, Rusani Old Smokey)
- Legality badges: green "Legal", red "Illegal", yellow "Conditional" (details available)
- Legality details view no longer duplicates the explanation text - it shows only the structured lists (illegal superpowers, governments, combinations, legal governments)
- Government types list expanded from 11 to 12: Anarchy, Communism, Confederacy, Cooperative, Corporate, Democracy, Dictatorship, Feudal, Patronage, Prison, Prison Colony, Theocracy

### Fixed
- Corrected legality data for Kamitra Cigars (Prison Colony, Theocracy, Corporate + Federal Democracy), Centauri Mega Gin (Prison Colony + Federal Theocracy), and Xihe Biomorphic Companions (Prison Colony + Federal Theocracy), and applied category rules across the alcohol/narcotics rares

### Security
- Curation is restricted to development mode - `/curate` only loads when `import.meta.env.DEV === true`, and its API endpoints return 403 in production

## [unstable v1.3] - 2025-12-08

### Added
- Removed the live deployment link (the app is local-only now)
- Rare goods dataset expanded from 36 to 140-142 items (count still being verified), adding 106 entries from Inara data with full system/station info and distance-to-star
- More pagination granularity: page sizes of 25, 50, 75, 100, 150, 200, 250, 500, and 1000 light years
- Results now sort closest-first, with systems of unknown coordinate placed at the end
- Finance Ethos is now auto-detected from the selected power instead of a manual checkbox; a green info box appears when it's active. Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval
- "Back to Top" button at the end of the results list, with smooth scroll
- Footer added to all pages with a dynamic copyright year and Elite Dangerous trademark notice

### Changed
- Removed the PowerPlay System Type dropdown - PowerPlay calculations are always "none" now, leaving just Current System and Pledged Power as inputs
- CP Divisor display simplified: the effective divisor is shown large and bold, colored green when Finance Ethos is active and yellow otherwise
- Corrected several station names against Inara data: "Alya Body Soap" (was "Alya Body Soup"), Chateau De Aegaeon → Schweickart Station, HIP 118311 Swarm → Lubbock Market, HIP Proto-Squid (was "HIP 41181 Ale") with the correct station, Aganippe Rush → Julian Market, Kachirigin Filter Leeches → Nowak Orbital, Eshu Umbrellas → Shajn Terminal, Rapa Bao Snake Skins → Flagg Gateway, Terra Mater Blood Bores → GR8Minds, Vanayequi Ceratomorpha Fur → Clauss Hub, Ngadandari Fire Opals → Napier Terminal, Wulpa Hyperbore Systems → Williams Gateway
- All rares now include distance from the arrival star to the station

### Fixed
- Result sorting now correctly places closest rares first, and systems with missing coordinates no longer show up at the top

## [unstable v1.2] - 2025-12-08

### Added
- Quick scan for rare goods near the current system, backed by a static dataset (nothing to update)
- PowerPlay 2.0 integration with full CP divisor calculations
- Legality evaluation across systems, plus distance calculations from the current system to each rare's origin
- System autocomplete via the EDSM API with caching, and fuzzy power autocomplete with faction badges
- Two-column responsive layout (form left, results right, stacking on mobile), dark theme via TailwindCSS
- Distance-based pagination by light-year range
- Initial technical and API documentation

### Features
- Static data - rare commodity locations never change
- One-button scan, no route-planning complexity
- Full PowerPlay 2.0 CP calculations preserved
- Routes are built manually by the user from scan results
- No scripts or data updates needed - everything is static

### Technical Stack
- Astro 5.x, TypeScript, React 19.x, TailwindCSS 4.x
- EDSM API as the external data source

### Data Model
- Rare goods: static dataset with system, station, pad, price, legality, distance, and PowerPlay info
- PowerPlay powers: full list of the 12 PowerPlay 2.0 powers with faction info
- System cache: optional pre-built cache of rare-origin system coordinates

### API Endpoints
- `GET /api/systems` - system autocomplete
- `GET /api/system-lookup` - system validation
- `POST /api/rares-scan` - scan for nearby rare goods

### Removed
- Analyze/route-planning mode (routes are planned manually)
- Dynamic data fields (stationState, allocation)
- One-off HTML processing scripts, the rare-systems fetch script (a pre-built cache is provided instead), and other maintenance/update scripts

### Philosophy
Rare commodities always spawn in the same places, so the data can stay static - no updates to maintain. The tool is meant to be quick: scan, then build a route by hand based on distance. PowerPlay functionality is fully preserved.
