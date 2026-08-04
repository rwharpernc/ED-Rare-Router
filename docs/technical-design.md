# Technical Design Document

**ED Rare Router**  
Version: Beta 1  
Last Updated: August 3, 2026

**Author:** R.W. Harper  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

## 1. Overview

ED Rare Router is a standalone web application built with Astro, TypeScript, React, and TailwindCSS. It helps Elite Dangerous players plan rare goods trading routes with PowerPlay 2.0 integration.

### 1.1 Purpose

The application provides:
- Quick scan to find rare goods near your current system
- Distance calculations from current system to rare goods origins
- Enhanced legality evaluation with detailed restrictions and explanations
- Comprehensive legality information showing which governments allow/disallow each item
- Manual curation interfaces for legality and price data (development mode only)
- PowerPlay 2.0 control point (CP) calculations for profit-based trading
- Route planning is done manually by the user based on scan results

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Astro 5.x | Static site generation, API routes |
| Language | TypeScript (strict) | Type-safe development |
| UI Framework | React 19.x | Interactive islands/components |
| Styling | TailwindCSS 4.x | Utility-first CSS |
| External API | EDSM | System coordinates and information |
| Build Tool | Vite | Fast development and builds |

## 2. Architecture

### 2.1 Project Structure

At a high level:

- **`src/pages/`** - `index.astro` (main page), `setup.astro` (first-run config), `curate.astro` / `curate-prices.astro` (dev-only curation UIs), and `api/` (9 endpoint files - system lookup, scanning, market data, cache status, setup, and the two curation APIs)
- **`src/components/`** - `Layout.astro` plus the React islands: the main planner (`RaresPlannerIsland.tsx`), inputs, results display, cache status, and the curation apps
- **`src/lib/`** - business logic: EDSM client and caches, distance/legality/PowerPlay calculations, curated legality/price management, config loading
- **`src/data/`** - the static `rares.ts` and `powers.ts` datasets
- **`src/types/`**, **`src/styles/`** - TypeScript definitions and global CSS
- **`data/`** - runtime caches, gitignored, generated locally (`.config.json` itself lives in the project root, not under `data/`)
- **`scripts/`** - maintainer tooling (setup, data curation helpers, the packaging build), not run by the app itself

For the full, exact file listing (kept in sync in one place to avoid drift), see **[Project Structure in the Developer Guide](./development.md#project-structure)**.

### 2.2 Component Architecture

#### 2.2.1 Page Components

- **`index.astro`**: Main entry point, renders `RaresPlannerIsland` as a React island
- **`Layout.astro`**: Base HTML structure with dark theme

#### 2.2.2 React Islands

- **`RaresPlannerIsland`**: Main interactive component managing:
  - Form state (current system, power)
  - Finance Ethos auto-detection from power selection
  - Quick scan functionality
  - API calls and result management
  - Vertical layout (selector panel above results)

- **`SystemInput`**: Autocomplete input for system names
  - Debounced API calls to `/api/systems`
  - Dropdown suggestions
  - Loading indicators

- **`PowerInput`**: Autocomplete input for PowerPlay powers
  - Fuzzy search on static power list
  - Faction badges
  - No API calls (client-side only)

- **`ResultsList`**: Displays analysis results
  - Card-based layout with 2-column grid (1 column on mobile, 2 columns on medium+ screens)
  - Shows comprehensive rare goods information (pad, cost, permit, distance, etc.)
  - Three-state legality display: Always Legal (green), Always Illegal (red), Conditional (yellow)
  - Expandable "Legality Details" section with comprehensive restriction information
  - Optional distance-based pagination (opt-in via checkbox, disabled by default)
    - When enabled: Paginate by distance ranges (25-1000 ly options)
    - When disabled: Shows all results sorted by distance
  - Visual indicators for "at origin" vs "system not found"
  - Displays scan results with distance, legality, and PowerPlay information

- **`CacheStatus`**: Displays when each cache file was last updated
  - Fetches `/api/cache-status` on mount
  - Renders nothing if no cache metadata is available yet

- **`LegalityCurator`**: Individual rare good legality editor (development only)
  - Edit superpower restrictions, government restrictions, and combined restrictions
  - Visual indicators for curated vs. base data
  - Save/delete functionality for curated data

- **`CuratorApp`**: Main curation interface (development only)
  - Search and filter rares
  - Load and display curated data
  - Manage curated legality overrides

- **`PriceCurator`**: Individual rare good price editor (development only)
  - Edit the curated baseline purchase price
  - Save/delete functionality for curated price data

- **`PriceCuratorApp`**: Main price curation interface (development only)
  - Search and filter rares
  - Load and display curated price data
  - Manage curated price overrides

### 2.3 API Architecture

All API endpoints are Astro API routes (`src/pages/api/*.ts`, 9 files):

1. **`POST /api/setup`**: Create/overwrite `.config.json` (first-run setup)
2. **`GET /api/setup-status`**: Whether `.config.json` exists yet
3. **`GET /api/systems?q=<query>`**: System autocomplete
4. **`GET /api/system-lookup?name=<name>`**: System validation
5. **`POST /api/rares-scan`**: Scan mode analysis
6. **`GET/POST/DELETE /api/curated-legality`**: Curated legality data (development only)
7. **`GET/POST/DELETE /api/curated-prices`**: Curated price data (development only)
8. **`GET /api/market-data`**: Cached (with live fallback) EDSM market data
9. **`GET /api/cache-status`**: Metadata about cache files

See [API Documentation](./api-documentation.md) for detailed specifications.

### 2.4 Data Flow

```
User Input → React Component → API Endpoint → Business Logic
                                                      ├─→ Rare Systems Cache (rareSystemsCache.json)
                                                      ├─→ EDSM API (user systems only)
                                                      └─→ Static Data (rares.ts)
                                                              ↓
                                                      Results → UI Display
```

## 3. Core Modules

### 3.1 Rare Systems Cache (`src/lib/rareSystemsCache.ts`)

**Purpose**: Load and provide cached rare origin system data.

**Features**:
- Optional, read-only cache file (`data/rareSystemsCache.json`) - this module never writes to it
- Loaded once if the file exists
- Used for rare origin system lookups when present
- Falls back to live EDSM API calls per rare, every scan, if the file doesn't exist (logs a warning)

**Functions**:
- `getRareOriginSystem(name: string)`: Get rare origin system from cache
- `getCacheMetadata()`: Get cache metadata (last updated, total systems)

**Cache Generation**:
- No script in the repo currently generates `data/rareSystemsCache.json` in the shape this module expects (an object keyed by normalized system name, each value an `EDSMSystem`, plus `_metadata`)
- `npm run generate:rare-coords` produces a related but different file, `data/rare-system-coords.json` - a flat `{ "SystemName": {x, y, z} }` map with un-normalized keys and no allegiance/government/`_metadata` - it isn't a drop-in replacement
- Without `rareSystemsCache.json`, the app still works correctly, just slower (a live EDSM lookup per rare on every scan instead of an in-memory hit)

### 3.2 EDSM Client (`src/lib/edsm.ts`)

**Purpose**: Centralized EDSM API integration with multi-layer caching for user-entered systems.

**Features**:
- In-memory cache with TTL for searches (15 minutes)
- Persistent disk cache for system lookups
- Debounced disk writes (5-second delay)
- Timeout handling (10 seconds)
- Graceful error handling

**Functions**:
- `searchSystems(query: string)`: Search for systems (autocomplete)
- `getSystem(name: string)`: Get exact system by name (user systems only)

**Caching Strategy**:
1. Check in-memory cache first
2. For `getSystem`: Check disk cache
3. If not cached, fetch from EDSM API
4. Store in memory and schedule disk write

**Note**: Rare origin systems use `rareSystemsCache.ts` instead of this module.

### 3.3 Distance Calculations (`src/lib/distances.ts`)

**Purpose**: Calculate 3D Euclidean distances between systems.

**Function**:
- `lyDistance(a: EDSMCoords, b: EDSMCoords)`: Returns distance in lightyears

**Formula**: `√((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)`

### 3.4 Legality Evaluation (`src/lib/legality.ts`)

**Purpose**: Determine if a rare good is legal in a system with comprehensive restriction details.

**Functions**:
- `evaluateLegality(rare: RareGood, system: EDSMSystem)`: Returns `LegalityResult` with detailed information
- `getLegalityDetails(rare: RareGood)`: Returns comprehensive legality information for display

**Logic** (checked in order of specificity):
1. Check combined superpower + government restrictions (most specific, e.g., "Federal Democracy")
2. Check government type restrictions (applies to all superpowers, e.g., "Prison Colony")
3. Check superpower restrictions (applies to all government types in that superpower, e.g., "Federation")

**Features**:
- Supports three types of restrictions:
  - `illegalInSuperpowers`: Illegal in all systems of a superpower
  - `illegalInGovs`: Illegal in all systems with that government type
  - `illegalInSuperpowerGovs`: Illegal only in specific combinations (e.g., Federation + Democracy)
- Returns detailed legality information including which governments allow/disallow the item
- Provides human-readable explanations of all restrictions

### 3.5 Curated Legality Management (`src/lib/curatedLegality.ts`)

**Purpose**: Manage manually curated legality data that overrides base data.

**Features**:
- Load/save curated data from `data/curatedLegality.json`
- Apply curated data to rare goods (overrides base data when present)
- Development-only functionality (restricted by environment check)

**Functions**:
- `loadCuratedLegality()`: Load curated data from disk
- `saveCuratedLegality(data)`: Save curated data to disk
- `applyCuratedLegality(rare, curated)`: Apply curated data to a rare good
- `getRaresWithCuratedData(rares, curated)`: Get all rares with curated data applied

**Data Structure**:
```typescript
interface CuratedLegalityData {
  [rareName: string]: {
    illegalInSuperpowers?: string[];
    illegalInGovs?: string[];
    illegalInSuperpowerGovs?: Array<{ superpower: string; government: string }>;
  };
}
```

### 3.6 Curated Price Management (`src/lib/curatedPrices.ts`)

**Purpose**: Manage manually curated baseline purchase prices, shown as the estimated cost for each rare good.

**Features**:
- Load/save curated price data from `data/curatedPrices.json`
- Apply curated prices to rare goods (overrides base data when present)
- Development-only functionality (restricted by environment check)
- Used in price display priority system

**Functions**:
- `loadCuratedPrices()`: Load curated price data from disk
- `saveCuratedPrices(data)`: Save curated price data to disk
- `applyCuratedPrices(rare, curated)`: Apply curated price to a rare good
- `getRaresWithCuratedPrices(rares, curated)`: Get all rares with curated prices applied
- `getCuratedPrice(rareName, curated)`: Get curated price for a specific rare

**Data Structure**:
```typescript
interface CuratedPriceData {
  [rareName: string]: {
    cost?: number; // Baseline purchase price in credits
  };
}
```

**Price Priority System**: When displaying costs, the system uses this priority:
1. **Curated baseline price** (if set) - shows "(Est.)"
2. **Static cost from rares.ts** (if exists) - shows "(Est.)"
3. **"N/A"** if none of the above

### 3.7 PowerPlay Calculations (`src/lib/powerplay.ts`)

**Purpose**: PowerPlay 2.0 CP calculations.

**Functions**:
- `ppEligibleForSystemType(rare, systemType)`: Check if rare is PP-eligible
- `cpDivisors(hasFinanceEthos)`: Calculate CP divisors

**Rules**:
- Only acquisition and exploit systems allow profit-based CP from rare goods
- Base divisor: 5333
- With finance ethos: 3555

## 4. Data Models

### 4.1 Rare Goods

See [Data Appendix](./data-appendix.md) for the complete rare goods structure.

**Key fields**:
- `rare`: name of the rare good
- `system` / `station`: origin system and station
- `pad`: landing pad size (S/M/L)
- `sellHintLy`: optimal selling distance
- `illegalInSuperpowers`: superpowers where illegal (all government types)
- `illegalInGovs`: government types where illegal (all superpowers)
- `illegalInSuperpowerGovs`: combined restrictions (specific superpower + government pairs)
- `pp.eligibleSystemTypes`: PowerPlay system types where the rare is eligible

### 4.2 Legality Details

```typescript
interface LegalityDetails {
  superpowerRestrictions: string[];  // Superpowers where illegal
  illegalGovernments: string[];      // Government types where illegal
  combinedRestrictions: Array<{     // Specific combinations where illegal
    superpower: string;
    government: string;
  }>;
  legalGovernments: string[];        // Government types where legal
  explanation: string;               // Human-readable explanation
}
```

### 4.3 PowerPlay Powers

**Structure**:
```typescript
interface PowerPlayPower {
  name: string;
  faction: "Federation" | "Alliance" | "Empire" | "Independent";
  hasFinanceEthos: boolean;
}
```

**Complete List** (12 powers):
- Federation: Felicia Winters, Jerome Archer
- Alliance: Edmund Mahon, Nakato Kaine
- Empire: Aisling Duval, Arissa Lavigny-Duval, Denton Patreus, Zemina Torval
- Independent: Archon Delaine, Li Yong-Rui, Pranav Antal, Yuri Grom

## 5. Performance Considerations

### 5.1 Caching Strategy

- **Rare Origin Systems**: Optional cache file, loaded on startup if present
  - When present, eliminates EDSM API calls for rare origins (142 rares across ~138 unique systems)
  - Faster response times for scan endpoint
  - See section 3.1 above - no script currently generates this file
- **User-Entered Systems**: Permanent in-memory + disk cache
  - Current system cached after first lookup
  - Debounced disk writes (5 seconds) to reduce I/O
- **System Searches**: 15-minute TTL in memory
- **Disk Cache**: Debounced writes (5 seconds) to reduce I/O
- **API Responses**: Cache-Control headers on autocomplete endpoint

### 5.2 API Rate Limiting

- **Rare origin systems**: No API calls if `data/rareSystemsCache.json` is present; a live call per rare per scan otherwise
- **User-entered systems**: Minimized through aggressive caching
- User-Agent header identifies the application
- Timeout handling prevents hanging requests (10 seconds)
- Graceful degradation on API errors
- Maintainer scripts self-throttle when calling EDSM: `scripts/generate-rare-coords.js` waits 500ms between requests, `scripts/fetch-edsm-market-data.js` waits 2000ms

### 5.3 Client-Side Optimizations

- Debounced input for autocomplete (300ms)
- React islands for selective hydration
- Static data loaded at build time
- Minimal JavaScript bundle size

## 6. Error Handling

### 6.1 API Errors

- EDSM API failures return empty arrays/null (graceful degradation)
- Network timeouts handled with 10-second limit
- Invalid responses logged but don't crash the application

### 6.2 User Input Validation

- Required fields validated before API calls
- System name validation through EDSM lookup
- Clear error messages displayed to users

## 7. Security Considerations

### 7.1 External API Usage

- User-Agent header for identification
- No authentication required (read-only EDSM API)
- Input sanitization for system names

### 7.2 Data Storage

- No user data stored
- System cache is public data (EDSM coordinates)
- No sensitive information in cache files

## 8. Deployment

### 8.1 Server Mode Configuration

The application uses Astro's server mode (`output: 'server'`) to enable API endpoints. This requires a server adapter for deployment.

**Configuration**:
- `output: 'server'` in `astro.config.mjs`
- API routes marked with `export const prerender = false;`
- Adapter required for target platform

### 8.2 Build Process

```bash
npm run build  # Generates server-rendered site in dist/
```

The build process:
1. Compiles TypeScript
2. Bundles React components
3. Generates server entry points
4. Creates Node.js server entry point

### 8.3 Deployment

The application targets **local deployment**, using the `@astrojs/node` adapter in standalone server mode. Run it directly with `node dist/server/entry.mjs`, or manage it with PM2 or systemd - see the [Local Deployment Guide](./local-deployment.md).

See [Deployment Guide](./deployment-guide.md) for detailed instructions.

### 8.4 Configuration

Local settings (EDSM User-Agent, data directory, API keys) live in `.config.json` in the project root, created via the first-run `/setup` flow, `npm run setup`, or by hand from `config.sample.json` - see [Setup Guide](./setup-guide.md). Environment variables override individual fields without editing the file:
- `EDSM_USER_AGENT`: Overrides `edsmUserAgent`
- `EDSM_API_KEY`: Overrides `apiKeys.edsm`

### 8.5 API Endpoints

All 9 API endpoints are server-rendered (see [section 2.3](#23-api-architecture) for the full list and [API Documentation](./api-documentation.md) for specifications).

## 9. Future Enhancements

Potential improvements:
- Smuggling mode (illegal goods route planning)
- Better economics modeling (profit calculations)
- Route optimization algorithms
- Export functionality (CSV/JSON)
- Historical data tracking
- User preferences/saved routes

## 10. References

- [Astro Documentation](https://docs.astro.build)
- [EDSM API Documentation](https://www.edsm.net/en/api)
- [Elite Dangerous PowerPlay 2.0](https://www.elitedangerous.com/news/powerplay-20-qa)
- [Inara.cz PowerPlay Listing](https://inara.cz/elite/powers/)

