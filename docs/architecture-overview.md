# Architecture Overview

**ED Rare Router**  
Version: unstable v1.0  
Last Updated: December 7, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

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
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP Requests
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (src/pages/api/)                         │  │
│  │  - GET  /api/systems                                 │  │
│  │  - POST /api/rares-scan                              │  │
│  │  - POST /api/rares-analyze                           │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Business Logic (src/lib/)                            │  │
│  │  - edsm.ts      (EDSM client + caching)              │  │
│  │  - distances.ts (3D distance calculations)          │  │
│  │  - legality.ts  (Legality evaluation)                │  │
│  │  - powerplay.ts (PP CP calculations)                 │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Static Data (src/data/)                              │  │
│  │  - rares.ts    (Rare goods dataset)                  │  │
│  │  - powers.ts   (PowerPlay powers list)               │  │
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

### Analyze Mode Flow

```
User Input
    │
    ▼
RaresPlannerIsland
    │
    ├─► SystemInput (current) → GET /api/systems
    ├─► SystemInput (target) → GET /api/systems
    │
    └─► Form Submit → POST /api/rares-analyze
                        │
                        ├─► getSystem(current) → EDSM API
                        ├─► getSystem(target) → EDSM API
                        │
                        ├─► For each rare:
                        │     ├─► getSystem(rare.system) → EDSM API
                        │     ├─► lyDistance(current → origin)
                        │     ├─► lyDistance(origin → target)
                        │     ├─► Check profit range (distance >= sellHintLy)
                        │     ├─► evaluateLegality(target) → Check legality
                        │     └─► ppEligibleForSystemType(target) → Check PP
                        │
                        ▼
                    AnalyzeResult[]
                        │
                        ▼
                    ResultsList Component
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

1. **In-Memory Cache** (System Lookups)
   - Type: `Map<string, EDSMSystem>`
   - TTL: None (persists for process lifetime)
   - Scope: Current process only

2. **In-Memory Cache** (System Searches)
   - Type: `Map<string, SearchCacheEntry>`
   - TTL: 15 minutes
   - Scope: Current process only

3. **Disk Cache** (System Lookups)
   - File: `data/systemCache.json`
   - Format: JSON object keyed by normalized system name
   - TTL: None (persists across restarts)
   - Write Strategy: Debounced (5-second delay)

4. **HTTP Cache** (API Responses)
   - Header: `Cache-Control: public, max-age=300`
   - TTL: 5 minutes
   - Scope: Browser/CDN

## State Management

### Component State (React)

```
RaresPlannerIsland
├─ currentSystem: string
├─ targetSystem: string
├─ currentPpType: PpSystemType
├─ targetPpType: PpSystemType
├─ power: string
├─ hasFinanceEthos: boolean
├─ mode: "scan" | "analyze"
├─ scanResults: ScanResult[]
├─ analyzeResults: AnalyzeResult[]
├─ isLoading: boolean
└─ error: string | null
```

### Server State (EDSM Cache)

```
edsm.ts Module
├─ systemCache: Map<string, EDSMSystem>      (in-memory)
├─ searchCache: Map<string, SearchCacheEntry> (in-memory, TTL)
└─ diskCache: Record<string, EDSMSystem>      (JSON file)
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

