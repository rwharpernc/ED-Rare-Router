# Technical Design Document

**ED Rare Router**  
Version: unstable v1.0  
Last Updated: December 7, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## 1. Overview

ED Rare Router is a standalone web application built with Astro, TypeScript, React, and TailwindCSS. It helps Elite Dangerous players plan rare goods trading routes with PowerPlay 2.0 integration.

### 1.1 Purpose

The application provides:
- Distance calculations from current/target systems to rare goods origins
- Legality evaluation for rare goods in different systems
- PowerPlay 2.0 control point (CP) calculations for profit-based trading
- Route planning between systems for optimal rare goods trading

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
│   │   └── api/                 # API endpoints
│   │       ├── systems.ts       # System autocomplete
│   │       ├── rares-scan.ts    # Scan mode
│   │       └── rares-analyze.ts # Analyze mode
│   ├── components/
│   │   ├── Layout.astro         # Page layout
│   │   ├── RaresPlannerIsland.tsx  # Main interactive component
│   │   ├── SystemInput.tsx      # System autocomplete input
│   │   ├── PowerInput.tsx       # Power autocomplete input
│   │   └── ResultsList.tsx     # Results display
│   ├── lib/                     # Business logic
│   │   ├── edsm.ts              # EDSM API client with caching
│   │   ├── distances.ts         # Distance calculations
│   │   ├── legality.ts          # Legality evaluation
│   │   └── powerplay.ts         # PowerPlay CP calculations
│   ├── data/                    # Static data
│   │   ├── rares.ts             # Rare goods dataset
│   │   └── powers.ts             # PowerPlay powers list
│   ├── types/                   # TypeScript definitions
│   │   ├── rares.ts
│   │   ├── edsm.ts
│   │   └── api.ts
│   └── styles/
│       └── global.css            # TailwindCSS imports
├── data/                         # Runtime data
│   └── systemCache.json         # EDSM system cache (generated)
├── docs/                         # Project documentation
└── public/                       # Static assets
```

### 2.2 Component Architecture

#### 2.2.1 Page Components

- **`index.astro`**: Main entry point, renders `RaresPlannerIsland` as a React island
- **`Layout.astro`**: Base HTML structure with dark theme

#### 2.2.2 React Islands

- **`RaresPlannerIsland`**: Main interactive component managing:
  - Form state (systems, PP type, power, finance ethos)
  - Mode selection (Scan vs Analyze)
  - API calls and result management
  - Two-column responsive layout

- **`SystemInput`**: Autocomplete input for system names
  - Debounced API calls to `/api/systems`
  - Dropdown suggestions
  - Loading indicators

- **`PowerInput`**: Autocomplete input for PowerPlay powers
  - Fuzzy search on static power list
  - Faction badges
  - No API calls (client-side only)

- **`ResultsList`**: Displays analysis results
  - Card-based layout
  - Shows distances, legality, PP eligibility, CP divisors
  - Supports both Scan and Analyze modes

### 2.3 API Architecture

All API endpoints are Astro API routes (`src/pages/api/*.ts`):

1. **`GET /api/systems?q=<query>`**: System autocomplete
2. **`POST /api/rares-scan`**: Scan mode analysis
3. **`POST /api/rares-analyze`**: Analyze mode analysis

See [API Documentation](./api-documentation.md) for detailed specifications.

### 2.4 Data Flow

```
User Input → React Component → API Endpoint → Business Logic → EDSM API
                                                      ↓
                                              Static Data (rares.ts)
                                                      ↓
                                              Results → UI Display
```

## 3. Core Modules

### 3.1 EDSM Client (`src/lib/edsm.ts`)

**Purpose**: Centralized EDSM API integration with multi-layer caching.

**Features**:
- In-memory cache with TTL for searches (15 minutes)
- Persistent disk cache for system lookups
- Debounced disk writes (5-second delay)
- Timeout handling (10 seconds)
- Graceful error handling

**Functions**:
- `searchSystems(query: string)`: Search for systems (autocomplete)
- `getSystem(name: string)`: Get exact system by name

**Caching Strategy**:
1. Check in-memory cache first
2. For `getSystem`: Check disk cache
3. If not cached, fetch from EDSM API
4. Store in memory and schedule disk write

### 3.2 Distance Calculations (`src/lib/distances.ts`)

**Purpose**: Calculate 3D Euclidean distances between systems.

**Function**:
- `lyDistance(a: EDSMCoords, b: EDSMCoords)`: Returns distance in lightyears

**Formula**: `√((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)`

### 3.3 Legality Evaluation (`src/lib/legality.ts`)

**Purpose**: Determine if a rare good is legal in a system.

**Function**:
- `evaluateLegality(rare: RareGood, system: EDSMSystem)`: Returns `LegalityResult`

**Logic**:
1. Check if rare is illegal in system's superpower (allegiance)
2. Check if rare is illegal in system's government type
3. Return legal status with human-readable reason

### 3.4 PowerPlay Calculations (`src/lib/powerplay.ts`)

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

- **System Searches**: 15-minute TTL in memory
- **System Lookups**: Permanent in-memory + disk cache
- **Disk Cache**: Debounced writes (5 seconds) to reduce I/O
- **API Responses**: Cache-Control headers on autocomplete endpoint

### 5.2 API Rate Limiting

- EDSM API calls are minimized through aggressive caching
- User-Agent header identifies the application
- Timeout handling prevents hanging requests
- Graceful degradation on API errors

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
4. Creates serverless function handlers (platform-dependent)

### 8.3 Supported Platforms

#### Netlify (Recommended)

- **Adapter**: `@astrojs/netlify`
- **Config**: `astro.config.netlify.mjs` (provided)
- **Setup**: `netlify.toml` configured automatically
- **Deployment**: Connect Git repo, auto-deploy on push

#### Vercel

- **Adapter**: `@astrojs/vercel`
- **Setup**: Update `astro.config.mjs` to use Vercel adapter
- **Deployment**: Connect Git repo, auto-deploy

#### Cloudflare Pages

- **Adapter**: `@astrojs/cloudflare`
- **Setup**: Update `astro.config.mjs` to use Cloudflare adapter
- **Deployment**: Connect Git repo, configure Workers

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
- `/api/rares-analyze` - Analyze mode route planning
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

