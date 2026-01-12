# Architecture Overview

**ED Rare Router**  
Version: unstable v1.4 (Unreleased)  
Last Updated: January 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Islands (Interactive Components)               │  │
│  │  - RaresPlannerIsland                                 │  │
│  │  - SystemInput                                        │  │
│  │  - PowerInput                                         │  │
│  │  - ResultsList                                        │  │
│  │  - LegalityCurator (dev only)                         │  │
│  │  - CuratorApp (dev only)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP Requests
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (src/pages/api/)                         │  │
│  │  - GET  /api/systems                                 │  │
│  │  - GET  /api/system-lookup                            │  │
│  │  - POST /api/rares-scan                              │  │
│  │  - GET/POST/DELETE /api/curated-legality (dev only)  │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Business Logic (src/lib/)                            │  │
│  │  - edsm.ts            (EDSM client + caching)         │  │
│  │  - rareSystemsCache.ts (Rare origin systems cache)    │  │
│  │  - distances.ts       (3D distance calculations)      │  │
│  │  - legality.ts       (Enhanced legality evaluation)    │  │
│  │  - powerplay.ts      (PP CP calculations)            │  │
│  │  - fuzzySearch.ts    (Fuzzy search utilities)         │  │
│  │  - curatedLegality.ts (Curated data management)      │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Static Data (src/data/)                              │  │
│  │  - rares.ts    (Rare goods dataset)                  │  │
│  │  - powers.ts   (PowerPlay powers list)               │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Cached Data (data/)                                  │  │
│  │  - rareSystemsCache.json (Pre-fetched rare origins)   │  │
│  │  - systemCache.json      (Runtime user system cache)  │  │
│  │  - curatedLegality.json  (Manual legality overrides)  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  EDSM API (www.edsm.net/api-v1)                      │  │
│  │  - /systems?systemName=<query>                        │  │
│  │  - /system?systemName=<name>                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### React Islands Pattern

ED Rare Router uses Astro's React Islands pattern for selective hydration:

```
┌─────────────────────────────────────────┐
│  index.astro (Static HTML)              │
│  ┌───────────────────────────────────┐ │
│  │  Layout.astro                      │ │
│  │  ┌───────────────────────────────┐ │ │
│  │  │  RaresPlannerIsland           │ │ │
│  │  │  (client:load)                │ │ │
│  │  │  ┌─────────────────────────┐ │ │ │
│  │  │  │  SystemInput            │ │ │ │
│  │  │  │  (React Component)      │ │ │ │
│  │  │  └─────────────────────────┘ │ │ │
│  │  │  ┌─────────────────────────┐ │ │ │
│  │  │  │  PowerInput             │ │ │ │
│  │  │  │  (React Component)      │ │ │ │
│  │  │  └─────────────────────────┘ │ │ │
│  │  │  ┌─────────────────────────┐ │ │ │
│  │  │  │  ResultsList            │ │ │ │
│  │  │  │  (React Component)      │ │ │ │
│  │  │  └─────────────────────────┘ │ │ │
│  │  └───────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Benefits**:
- Minimal JavaScript bundle size
- Fast initial page load
- Only interactive components are hydrated
- Better performance on low-end devices

## Data Flow

### Scan Mode Flow

```
User Input
    │
    ▼
RaresPlannerIsland
    │
    ├─► SystemInput → GET /api/systems?q=<query>
    │                    │
    │                    ▼
    │                EDSM API (cached)
    │
    └─► Form Submit → POST /api/rares-scan
                        │
                        ├─► getSystem(current) → EDSM API (cached)
                        │
                        ├─► For each rare:
                        │     ├─► getSystem(rare.system) → EDSM API (cached)
                        │     ├─► lyDistance() → Calculate distance
                        │     ├─► evaluateLegality() → Check legality
                        │     └─► ppEligibleForSystemType() → Check PP eligibility
                        │
                        ▼
                    ScanResult[]
                        │
                        ▼
                    ResultsList Component
```

### Scan Mode Flow

```
User Input
    │
    ▼
RaresPlannerIsland
    │
    ├─► SystemInput (current) → GET /api/systems
    │
    └─► Form Submit → POST /api/rares-scan
                        │
                        ├─► getSystem(current) → EDSM API
                        │
                        ├─► For each rare:
                        │     ├─► getRareOriginSystem(rare.system) → Cache/EDSM
                        │     ├─► lyDistance(current → origin)
                        │     ├─► evaluateLegality(current) → Check legality
                        │     └─► ppEligibleForSystemType(current) → Check PP
                        │
                        ▼
                    ScanResult[]
                        │
                        ▼
                    ResultsList Component
                        │
                        ▼
                    User manually plans route based on results
```

## Caching Architecture

### Multi-Layer Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│  Application Request                                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  In-Memory Cache      │
            │  (Fastest)            │
            │  - System lookups     │
            │  - Search results     │
            │    (15min TTL)        │
            └───────────┬───────────┘
                        │ Cache Miss
                        ▼
            ┌───────────────────────┐
            │  Disk Cache           │
            │  (Fast)               │
            │  - systemCache.json   │
            │  - Persistent         │
            └───────────┬───────────┘
                        │ Cache Miss
                        ▼
            ┌───────────────────────┐
            │  EDSM API             │
            │  (Slowest)            │
            │  - External network   │
            └───────────────────────┘
```

### Cache Layers

1. **Rare Systems Cache** (Pre-generated)
   - File: `data/rareSystemsCache.json`
   - Format: JSON object keyed by normalized system name
   - TTL: None (manually updated via script)
   - Scope: All rare origin systems
   - Usage: Loaded on startup, used for all rare origin lookups
   - Provided as pre-built cache file

2. **In-Memory Cache** (System Lookups - User Systems)
   - Type: `Map<string, EDSMSystem>`
   - TTL: None (persists for process lifetime)
   - Scope: Current process only
   - Usage: User-entered current system

3. **In-Memory Cache** (System Searches)
   - Type: `Map<string, SearchCacheEntry>`
   - TTL: 15 minutes
   - Scope: Current process only
   - Usage: Autocomplete suggestions

4. **Disk Cache** (System Lookups - User Systems)
   - File: `data/systemCache.json`
   - Format: JSON object keyed by normalized system name
   - TTL: None (persists across restarts)
   - Write Strategy: Debounced (5-second delay)
   - Usage: User-entered systems only

5. **HTTP Cache** (API Responses)
   - Header: `Cache-Control: public, max-age=300`
   - TTL: 5 minutes
   - Scope: Browser/CDN

## State Management

### Component State (React)

```
RaresPlannerIsland
├─ currentSystem: string
├─ power: string
├─ hasFinanceEthos: boolean (auto-calculated from power)
├─ scanResults: ScanResult[]
├─ isLoading: boolean
└─ error: string | null
```

### Server State (Caching)

```
rareSystemsCache.ts Module
└─ cache: RareSystemCache                    (loaded from JSON file)

edsm.ts Module
├─ systemCache: Map<string, EDSMSystem>      (in-memory, user systems)
├─ searchCache: Map<string, SearchCacheEntry> (in-memory, TTL)
└─ diskCache: Record<string, EDSMSystem>      (JSON file, user systems)
```

## Error Handling Strategy

### Client-Side Errors

```
User Action
    │
    ▼
Component Error
    │
    ├─► Display error message in UI
    ├─► Log to console (development)
    └─► Graceful degradation (show empty state)
```

### Server-Side Errors

```
API Request
    │
    ▼
API Endpoint
    │
    ├─► Validation Error → 400 Bad Request
    ├─► EDSM API Error → Graceful degradation
    │   ├─► Return empty array/null
    │   └─► Log error for debugging
    └─► Processing Error → 500 Internal Server Error
```

## Performance Optimizations

### 1. Code Splitting
- React islands loaded only when needed
- Minimal JavaScript bundle size

### 2. Caching
- Aggressive caching reduces EDSM API calls by ~90%
- Disk cache survives restarts
- HTTP caching for browser/CDN

### 3. Debouncing
- Input debouncing (300ms) reduces API calls
- Disk write debouncing (5s) reduces I/O

### 4. Parallel Processing
- `Promise.all()` for parallel rare goods processing
- Concurrent EDSM API calls where possible

## Security Considerations

### Input Validation
- System names validated through EDSM lookup
- Type checking via TypeScript
- No SQL injection risk (no database)

### External API Usage
- User-Agent header for identification
- Timeout handling prevents hanging requests
- Rate limiting through caching

### Data Privacy
- No user data stored
- No authentication required
- System cache contains only public data

## Deployment Architecture

### Server Mode (Current)

The application uses Astro's server mode for API endpoints:

```
Build Time
    │
    ├─► Astro generates server entry points
    ├─► React components bundled
    ├─► TypeScript compiled
    ├─► Assets optimized
    └─► Adapter generates platform-specific handlers
    │
    ▼
dist/ directory
    │
    ├─► client/ (static assets)
    │   ├─► index.html
    │   └─► _astro/ (bundled JS/CSS)
    └─► server/ (server entry points)
        └─► entry.mjs (Node.js) or serverless functions
```

### Serverless Functions

API routes are deployed as serverless functions based on adapter:
- **Netlify**: Serverless functions (AWS Lambda)
- **Vercel**: Edge functions or serverless functions
- **Cloudflare Pages**: Workers
- **Node.js**: Standalone server process

### API Endpoints

All endpoints in `src/pages/api/` are:
- Server-rendered (`prerender = false`)
- Converted to platform-specific serverless functions
- Available at `/api/*` paths

## Scalability

### Current Limitations
- Single instance (no load balancing)
- File-based cache (not shared across instances)
- No database (static data only)

### Future Scalability Options
- Redis for shared cache
- Database for system cache
- CDN for static assets
- Load balancing for API routes

## Monitoring & Observability

### Current Logging
- Console logging for errors
- EDSM API call logging
- Cache hit/miss tracking (via console)

### Future Enhancements
- Structured logging
- Error tracking (Sentry, etc.)
- Performance monitoring
- Analytics integration

