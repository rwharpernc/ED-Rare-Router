# Technical Design Document

**ED Rare Router**  
Version: Alpha 1.05  
Last Updated: February 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

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

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Main page
│   │   ├── curate.astro         # Legality curation page (dev only)
│   │   ├── curate-prices.astro  # Price curation page (dev only)
│   │   └── api/                 # API endpoints
│   │       ├── systems.ts       # System autocomplete
│   │       ├── rares-scan.ts    # Scan mode
│   │       ├── system-lookup.ts # System validation
│   │       ├── curated-legality.ts # Legality curation API (dev only)
│   │       └── curated-prices.ts   # Price curation API (dev only)
│   ├── components/
│   │   ├── Layout.astro         # Page layout
│   │   ├── RaresPlannerIsland.tsx  # Main interactive component
│   │   ├── SystemInput.tsx      # System autocomplete input
│   │   ├── PowerInput.tsx       # Power autocomplete input
│   │   ├── ResultsList.tsx      # Results display with pagination
│   │   ├── LegalityCurator.tsx  # Individual rare legality editor
│   │   ├── CuratorApp.tsx       # Legality curation interface app
│   │   ├── PriceCurator.tsx     # Individual rare price editor
│   │   └── PriceCuratorApp.tsx  # Price curation interface app
│   ├── lib/                     # Business logic
│   │   ├── edsm.ts              # EDSM API client (user systems)
│   │   ├── rareSystemsCache.ts  # Rare origin systems cache loader
│   │   ├── distances.ts         # Distance calculations
│   │   ├── legality.ts          # Legality evaluation with detailed restrictions
│   │   ├── powerplay.ts         # PowerPlay CP calculations
│   │   ├── fuzzySearch.ts      # Fuzzy search utilities
│   │   ├── curatedLegality.ts  # Curated legality data management
│   │   ├── curatedPrices.ts    # Curated price data management
│   │   ├── eddnMarketCache.ts  # EDDN market data cache reader
│   │   └── edsmMarketCache.ts  # EDSM market data cache reader
│   ├── data/                    # Static data
│   │   ├── rares.ts             # Rare goods dataset
│   │   └── powers.ts             # PowerPlay powers list
│   ├── scripts/                 # Utility scripts (currently empty)
│   ├── types/                   # TypeScript definitions
│   │   ├── rares.ts
│   │   ├── edsm.ts
│   │   └── api.ts
│   └── styles/
│       └── global.css            # TailwindCSS imports
├── data/                         # Runtime/cached data
│   ├── rareSystemsCache.json    # Pre-fetched rare origin systems (generated)
│   ├── systemCache.json         # EDSM system cache for user systems (generated)
│   ├── curatedLegality.json     # Manually curated legality overrides (generated, dev only)
│   ├── curatedPrices.json       # Manually curated price overrides (generated, dev only)
│   ├── eddnMarketCache.json     # EDDN real-time market data cache (generated)
│   └── edsmMarketData.json      # EDSM bulk-fetched market data cache (generated)
├── docs/                         # Project documentation
└── public/                       # Static assets
```

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

- **`LegalityCurator`**: Individual rare good legality editor (development only)
  - Edit superpower restrictions, government restrictions, and combined restrictions
  - Visual indicators for curated vs. base data
  - Save/delete functionality for curated data

- **`CuratorApp`**: Main curation interface (development only)
  - Search and filter rares
  - Load and display curated data
  - Manage curated legality overrides

### 2.3 API Architecture

All API endpoints are Astro API routes (`src/pages/api/*.ts`):

1. **`GET /api/systems?q=<query>`**: System autocomplete
2. **`GET /api/system-lookup?name=<name>`**: System validation
3. **`POST /api/rares-scan`**: Scan mode analysis
4. **`GET /api/curated-legality`**: Get curated legality data (development only)
5. **`POST /api/curated-legality`**: Update curated legality data (development only)
6. **`DELETE /api/curated-legality`**: Delete curated legality data (development only)

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
- Pre-generated cache file (`data/rareSystemsCache.json`)
- Loaded on application startup
- Used for all rare origin system lookups
- Falls back to API if cache miss (should be rare)

**Functions**:
- `getRareOriginSystem(name: string)`: Get rare origin system from cache
- `getCacheMetadata()`: Get cache metadata (last updated, total systems)

**Cache Generation**:
- Cache file (`data/rareSystemsCache.json`) should be provided pre-built
- Fetches all unique systems from `rares.ts`
- Includes rate limiting (200ms between requests)
- Stores coordinates, allegiance, and government data

**When to run**:
- Before first deployment (recommended for production)
- After adding new rare goods to the dataset
- After correcting system names in the rare goods data
- Periodically to refresh system data (optional)

**Important**: The application works without this cache (falls back to API), but performance will be slower. The cache file should be committed to the repository for deployments.

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

### 3.6 Curated Legality Management (`src/lib/curatedLegality.ts`)

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

### 3.7 Curated Price Management (`src/lib/curatedPrices.ts`)

**Purpose**: Manage manually curated baseline purchase prices that serve as fallback when EDDN market data is unavailable.

**Features**:
- Load/save curated price data from `data/curatedPrices.json`
- Apply curated prices to rare goods (overrides base data when present)
- Development-only functionality (restricted by environment check)
- Used as fallback in price display priority system

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
1. **EDDN live market data** (if available) - shows "(Live)"
2. **Curated baseline price** (if set) - shows "(Est.)"
3. **Static cost from rares.ts** (if exists) - shows "(Est.)"
4. **"N/A"** if none of the above

### 3.8 EDDN Market Data Cache (`src/lib/eddnMarketCache.ts`)

**Purpose**: Read real-time market data from EDDN worker cache.

**Features**:
- Loads market data from `data/eddnMarketCache.json` (updated by EDDN worker)
- Handles nested cache structures (from worker save format)
- Provides market data lookup by system/station or rare name

**Functions**:
- `loadEDDNMarketCache()`: Load EDDN cache from disk
- `getEDDNMarketData(system, station)`: Get market data for specific station
- `getEDDNRareGoodData(rareName)`: Get market data by rare good name
- `getAllEDDNMarketData()`: Get all cached market data

**Data Structure**:
```typescript
interface EDDNCachedMarketEntry {
  rare: string;
  system: string;
  station: string;
  updates: EDDNMarketUpdate[];
  latest?: {
    timestamp: string;
    stock: number;
    stockBracket: number;
    buyPrice: number;
    sellPrice: number;
  };
}
```

### 3.5 PowerPlay Calculations (`src/lib/powerplay.ts`)

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

See [Data Appendix](./data-appendix.md) for complete rare goods structure.

**Key Fields**:
- `illegalInSuperpowers`: Array of superpowers where illegal (all government types)
- `illegalInGovs`: Array of government types where illegal (all superpowers)
- `illegalInSuperpowerGovs`: Array of combined restrictions (specific superpower + government combinations)

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

**Key Fields**:
- `rare`: Name of the rare good
- `system`: Origin system name
- `station`: Origin station name
- `pad`: Landing pad size (S/M/L)
- `sellHintLy`: Optimal selling distance
- `illegalInSuperpowers`: Array of superpowers where illegal
- `illegalInGovs`: Array of government types where illegal
- `pp.eligibleSystemTypes`: PP system types where eligible

### 4.2 PowerPlay Powers

**Structure**:
```typescript
interface PowerPlayPower {
  name: string;
  faction: "Federation" | "Alliance" | "Empire" | "Independent";
}
```

**Complete List** (12 powers):
- Federation: Felicia Winters, Jerome Archer
- Alliance: Edmund Mahon, Nakato Kaine
- Empire: Aisling Duval, Arissa Lavigny-Duval, Denton Patreus, Zemina Torval
- Independent: Archon Delaine, Li Yong-Rui, Pranav Antal, Yuri Grom

## 5. Performance Considerations

### 5.1 Caching Strategy

- **Rare Origin Systems**: Pre-generated cache file loaded on startup
  - Eliminates EDSM API calls for rare origins (35+ systems)
  - Faster response times for scan endpoint
  - Provided as pre-built cache file (`data/rareSystemsCache.json`)
- **User-Entered Systems**: Permanent in-memory + disk cache
  - Current system cached after first lookup
  - Debounced disk writes (5 seconds) to reduce I/O
- **System Searches**: 15-minute TTL in memory
- **Disk Cache**: Debounced writes (5 seconds) to reduce I/O
- **API Responses**: Cache-Control headers on autocomplete endpoint

### 5.2 API Rate Limiting

- **Rare origin systems**: No API calls (use pre-generated cache)
- **User-entered systems**: Minimized through aggressive caching
- User-Agent header identifies the application
- Timeout handling prevents hanging requests (10 seconds)
- Graceful degradation on API errors
- Rate limiting in fetch script (200ms between requests)

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

The application is designed for **local deployment**:

- **Adapter**: `@astrojs/node` (configured in `astro.config.mjs`)
- **Mode**: Standalone server
- **Deployment**: Run on your local machine or server
- **Process Management**: Use PM2 or systemd (see [Local Deployment Guide](./local-deployment.md))

#### Node.js (Self-hosted)

- **Adapter**: `@astrojs/node` (default for local dev)
- **Mode**: Standalone server
- **Deployment**: Run `node dist/server/entry.mjs`

See [Deployment Guide](./deployment-guide.md) for detailed instructions.

### 8.4 Environment Variables

- `EDSM_USER_AGENT`: Optional custom User-Agent string for EDSM API requests

### 8.5 API Endpoints

All API endpoints are server-rendered and available as:
- `/api/systems` - System autocomplete
- `/api/rares-scan` - Scan mode analysis
- `/api/system-lookup` - System verification

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

