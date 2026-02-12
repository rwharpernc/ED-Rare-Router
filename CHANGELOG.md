# Changelog

All notable changes to this project will be documented in this file.

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses a three-tier versioning system: **unstable**, **beta**, and **release**.

## Versioning System

- **unstable**: Development versions with active changes and potential breaking changes
- **beta**: Feature-complete versions undergoing testing and refinement
- **release**: Stable production-ready versions

## [unstable v1.4] - 2026-02-12

**Note: This version is not fully tested.**

### Added
- **Local config file** - Optional `.config.json` (gitignored) for paths and secrets
  - Copy `config.sample.json` to `.config.json`; all API keys and personal settings in one place
  - `edsmUserAgent` for EDSM API contact (no personal email in repo)
  - `dataDir` optional override for cache/data directory
  - `apiKeys` object for all API keys (e.g. `edsm`, `eddn`); env override via `EDSM_API_KEY`, `EDDN_API_KEY`, etc.
- **Config loaders** - `src/lib/config.ts` (app) and `scripts/load-config.js` (scripts/worker) with `getDataDir()`, `getEdsmUserAgent()`, `getApiKey(name)`

### Changed
- **Paths** - All data/cache paths now use config `getDataDir()` (default `data/` in project root)
- **User-Agent** - EDSM and fetch script use config/env; removed hardcoded contact from codebase
- **Documentation** - README and docs updated for config setup and API keys

## [unstable v1.4] - 2026-01-13

### Added
- **Price Curation System** - Manual curation interface for baseline purchase prices
  - New `/curate-prices` page for managing baseline prices (development mode only)
  - Price curation API endpoints (`GET`, `POST`, `DELETE /api/curated-prices`)
  - Price fallback system: EDDN live data → Curated prices → Static costs → N/A
  - Prices displayed in scan results with source indicators (Live/Est.)
  - Stock and sell price information from EDDN when available
- **EDDN Market Data Integration** - Real-time market data from EDDN worker
  - Live buy/sell prices and stock information
  - Automatic cache updates as market data is received
  - Market data displayed in scan results when available
  - EDDN cache reader with nested structure handling
  - ZeroMQ v6 API migration for EDDN worker
  - Zlib decompression for EDDN messages
- **Troubleshooting Documentation** - New troubleshooting notes document
  - Rare commodities count discrepancy analysis (140 vs 142)
  - EDDN market data limitations explanation
  - Price display priority system documentation
  - Cache status API fix documentation
  - ZeroMQ v6 API migration notes
  - Nested cache structure fix documentation
- **Cache Status Fixes** - Fixed `existsSync` import error in cache-status API
- **Navigation Improvements** - Return links on curation pages, temporary curation buttons in footer (development mode only)
- **EDDN Worker Enhancements** - Improved logging and error handling
  - Progress messages with time estimates
  - Enhanced notifications when market data is received
  - Better error messages for missing market data
  - Increased API delay to 2 seconds (more polite to EDSM)

### Changed
- **Rare Commodities Count** - Updated documentation to reflect 140-142 rare commodities (still being verified)
  - Updated all references from fixed "142" to "140-142 (still being verified)"
  - Added notes about count discrepancy investigation
  - Updated README, CHANGELOG, and all documentation files
- **Documentation cleanup** - Comprehensive cleanup of all documentation
  - Removed Netlify-specific documentation and workarounds
  - Updated all docs to reflect local deployment as primary approach
  - Removed abandoned methods and trial-and-error references
  - Cleaned up deployment guide to focus on local deployment
  - Updated EDDN integration docs to reflect current implementation
  - Removed serverless architecture references from technical docs
  - Updated API documentation base URLs for local deployment
  - Added market-data API endpoint documentation
  - Reorganized documentation index for clarity
  - All documentation now reflects clean, production-ready approach

### Removed
- **Netlify dependencies and configuration** - Removed all Netlify-specific files and dependencies
  - Removed `@astrojs/netlify` package dependency
  - Deleted `astro.config.netlify.mjs` configuration file
  - Deleted `netlify.toml` deployment configuration
  - Removed unused `start:local` script reference
- **Unused code** - Cleaned up unused files
  - Deleted `src/lib/eddnCache.ts` (replaced by `edsmMarketCache.ts`)
  - Package.json now contains only dependencies needed for local deployment

## [unstable v1.4] - 2026-01-12

### Added
- **Enhanced legality system** - Comprehensive legality information with detailed restrictions
  - Added support for combined superpower + government restrictions (e.g., "Federal Democracy")
  - Detailed legality explanations showing which governments allow/disallow each item
  - Three-state legality display: Always Legal, Always Illegal, or Conditional
  - Expandable "Legality Details" section for each rare good
  - Shows illegal superpowers, illegal governments, and combined restrictions separately
  - Disclaimer on legality notes indicating information is still being validated
- **Legality curation system** - Manual curation interface for development mode
  - New `/curate` page (development only) for editing legality data
  - API endpoints for reading/writing curated legality data (`/api/curated-legality`)
  - Curated data stored in `data/curatedLegality.json` and overrides base data
  - Search and filter functionality for finding rares to curate
  - Visual indicators for curated vs. base data
- **Legality categories documentation** - Reference guide for legality patterns
  - Alcohol/Liquor category rules (Prison Colony + Federal/Alliance Theocracies)
  - Narcotics category rules (Federal/Imperial + most Alliance systems)
  - Tobacco category rules
  - Weapons category notes
  - Documentation file: `docs/legality-categories.md`
- **Data accuracy documentation** - Guide for maintaining legality data
  - Instructions for manually curating data from Inara.cz
  - Examples of translating Inara notes to data structure
  - Documentation file: `docs/data-accuracy-notes.md`
- **Prison government type** - Added "Prison" to government types list
  - "Prison Colony" remains the standard system government type
  - "Prison" added for Detention Centres (facilities, not full systems)
  - Both types available in curation UI
- **Project disclaimers** - Added comprehensive disclaimers throughout documentation
  - Prominent warnings in all documentation files that this is a development/hobby project
  - "Use at your own risk" notices with warranty disclaimers
  - References to GPL v3.0 license terms
  - Updated files: README.md, CHANGELOG.md, TODO.md, and all docs/*.md files

### Changed
- **Layout redesign** - Changed from side-by-side to vertical layout
  - Selector panel (Configuration) now appears above results on all screen sizes
  - Removed responsive two-column layout (grid)
  - Consistent vertical stacking regardless of viewport size
- **Legality data structure** - Enhanced to support complex restrictions
  - Added `illegalInSuperpowerGovs` field for combined restrictions
  - Updated data for multiple rares based on category rules:
    - Alcohol/Liquor: Lavian Brandy, Centauri Mega Gin, Eranin Pearl Whisky, Kongga Ale
    - Narcotics: All Onionhead variants, Lyrae Weed, Tarach Spice
    - Tobacco: Kamitra Cigars (already had data), Rusani Old Smokey
- **Legality badge display** - Three-state system for clarity
  - Green "Legal" badge for items legal in all systems
  - Red "Illegal" badge for items illegal in all systems
  - Yellow "Conditional" badge for items with restrictions (indicates details available)
- **Legality details display** - Streamlined to remove duplicate information
  - Removed redundant explanation text that duplicated structured breakdown
  - Now shows only structured lists (illegal superpowers, governments, combinations, legal governments)
  - Cleaner, more scannable format without information duplication
- **Government types list** - Expanded from 11 to 12 types
  - Added "Prison" government type alongside "Prison Colony"
  - Complete list: Anarchy, Communism, Confederacy, Cooperative, Corporate, Democracy, Dictatorship, Feudal, Patronage, Prison, Prison Colony, Theocracy

### Fixed
- **Legality accuracy** - Updated multiple rare goods with correct legality data
  - Fixed Kamitra Cigars (Prison Colony, Theocracy, Corporate + Federal Democracy)
  - Fixed Centauri Mega Gin (Prison Colony + Federal Theocracy)
  - Fixed Xihe Biomorphic Companions (Prison Colony + Federal Theocracy)
  - Applied category-based rules to alcohol and narcotics rares

### Security
- **Development-only curation** - Curation interface restricted to development mode
  - `/curate` page only accessible when `import.meta.env.DEV === true`
  - API endpoints return 403 Forbidden in production
  - Prevents unauthorized data modification in production

## [unstable v1.3] - 2025-12-08

### Added
- **Live deployment link** - Removed (application is now local-only)
- **Comprehensive rare goods dataset** - Expanded from 36 to 140-142 rare commodities (count still being verified)
  - Added 106 new rare goods from Inara data
  - Includes all major rare commodities from Elite Dangerous
  - Complete system and station information with distance to star data
- **Enhanced pagination options** - More granular distance-based pagination
  - Added page size options: 25, 50, 75, 100, 150, 200, 250, 500, 1000 light years
  - Better control over result viewing for large datasets
- **Improved result sorting** - Closest rares shown first
  - Results sorted by distance (closest to furthest)
  - Systems with unknown coordinates placed at end
- **Finance Ethos auto-detection** - Automatically determined from selected power
  - Finance Ethos checkbox removed - now auto-detected from power selection
  - Green info box appears when Finance Ethos is active
  - Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval
- **Back to Top button** - Navigation button at end of results list
  - Smooth scroll to top of page
  - Appears after all results are displayed
- **Footer with dynamic copyright** - Footer added to all pages
  - Dynamic year updates automatically
  - Includes Elite Dangerous trademark notice

### Changed
- **Simplified UI** - Removed PowerPlay System Type dropdown
  - PowerPlay calculations disabled (always set to "none")
  - Cleaner, simpler configuration form
  - Only Current System and Pledged Power inputs remain
- **Simplified CP Divisor display** - Clearer, less confusing presentation
  - Shows effective divisor prominently (large, bold)
  - Color-coded: green when Finance Ethos active, yellow otherwise
  - Contextual information about Finance Ethos status
- **Updated station names** - Corrected station names from Inara data
  - Fixed "Alya Body Soap" (was "Alya Body Soup")
  - Updated "Chateau De Aegaeon" station to "Schweickart Station"
  - Updated "HIP 118311 Swarm" station to "Lubbock Market"
  - Updated "HIP Proto-Squid" (was "HIP 41181 Ale") with correct station
  - Updated "Aganippe Rush" station to "Julian Market"
  - Updated "Kachirigin Filter Leeches" station to "Nowak Orbital"
  - Updated "Eshu Umbrellas" station to "Shajn Terminal"
  - Updated "Rapa Bao Snake Skins" station to "Flagg Gateway"
  - Updated "Terra Mater Blood Bores" station to "GR8Minds"
  - Updated "Vanayequi Ceratomorpha Fur" station to "Clauss Hub"
  - Updated "Ngadandari Fire Opals" station to "Napier Terminal"
  - Updated "Wulpa Hyperbore Systems" station to "Williams Gateway"
- **Added distance to star data** - All rares now include distance from arrival star to station

### Fixed
- Result sorting now properly places closest rares first
- Systems with missing coordinates no longer appear at the top of results

## [unstable v1.2] - 2025-12-08

### Added
- **Quick scan functionality** - Find rare goods near your current system
- **Static rare goods dataset** - All rare commodity data is static (no updates needed)
- **PowerPlay 2.0 integration** - Full CP divisor calculations for profit-based trading
- **Legality evaluation** - Check if rares are legal in different systems
- **Distance calculations** - Compute distances from current system to rare origins
- **System autocomplete** - Search for systems using EDSM API with intelligent caching
- **Power autocomplete** - Fuzzy search for PowerPlay powers with faction badges
- **Two-column responsive layout** - Form on left, results on right (stacks on mobile)
- **Dark theme UI** - Modern, clean interface with TailwindCSS
- **Distance-based pagination** - Optional pagination by light-year ranges
- **Comprehensive documentation** - Complete technical and API documentation

### Features
- **Static Data Philosophy**: All rare commodity data is static - locations never change
- **Quick & Simple**: Single scan button, no complex route planning
- **PowerPlay Ready**: Full PowerPlay 2.0 CP calculations preserved
- **Manual Route Planning**: Users build routes manually from scan results
- **No Maintenance**: No scripts or data updates needed - everything is static

### Technical Stack
- **Astro 5.x** - Framework for server-side rendering and API routes
- **TypeScript** - Type-safe development throughout
- **React 19.x** - Interactive UI components (islands)
- **TailwindCSS 4.x** - Utility-first CSS framework
- **EDSM API** - External data source for system information

### Data Model
- **Rare Goods**: Static dataset with system, station, pad, price, legality, distance, PowerPlay info
- **PowerPlay Powers**: Complete list of 12 PowerPlay 2.0 powers with faction information
- **System Cache**: Optional pre-built cache file for rare origin system coordinates

### API Endpoints
- `GET /api/systems` - System autocomplete
- `GET /api/system-lookup` - System validation
- `POST /api/rares-scan` - Scan for nearby rare goods

### Removed
- Analyze/route planning mode (users plan routes manually)
- Dynamic data fields (stationState, allocation)
- HTML processing scripts (one-off comparison only)
- Rare systems fetch script (cache file provided pre-built)
- All maintenance/update scripts

### Philosophy
This application focuses on **static route planning data**:
- Rare commodities are always found in the same places
- No need to keep data updated
- Quick and easy tool for building routes based on distance
- PowerPlay functionality fully preserved
- Route planning done manually by user from scan results
