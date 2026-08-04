# API Documentation

**ED Rare Router API**  
Version: Beta 1  
Last Updated: August 3, 2026

**Author:** R.W. Harper  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This API is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding accuracy, reliability, availability, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this API. See the [LICENSE](../LICENSE) file for full terms.

## Overview

The API covers system autocomplete and rare goods scanning. Every endpoint returns JSON and uses standard HTTP status codes.

This is a quick-scan tool for finding rare goods near your current location - route planning itself stays manual, based on the scan results.

### Finance Ethos

Finance Ethos is automatically determined from the `power` parameter. Powers with Finance Ethos:
- Denton Patreus (Empire)
- Jerome Archer (Federation)
- Li Yong-Rui (Independent)
- Zemina Torval (Empire)

When a power with Finance Ethos is selected, the `hasFinanceEthos` flag is automatically set to `true`. Note: PowerPlay calculations are currently disabled (system type is always "none").

## Base URL

All endpoints are relative to the application root:
- Local: `http://localhost:4321` (default port)
- Custom port: Configure in `astro.config.mjs` if using a different port

## Endpoints

### 0. Setup (first-run config)

**Endpoint**: `POST /api/setup`

**Description**: Creates or overwrites `.config.json` in the project root. Used by the first-run setup page and when the user explicitly replaces existing config.

**Request Headers**: `Content-Type: application/json`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `edsmUserAgent` | string | No (recommended) | User-Agent/contact for EDSM API (e.g. `ED-Rare-Router/1.0 (contact: your@email.com)`). Falls back to a generic default if omitted. |
| `dataDir` | string \| null | No | Absolute path to data directory; `null` or empty = default `data/` |
| `apiKeys` | object | No | Keys: `edsm`, etc. (lowercase). Values: API key strings. |
| `overwrite` | boolean | No | If `true`, replace existing `.config.json`. Required when config already exists. |

**Response** (201 Created):
```json
{ "ok": true, "message": "Config saved." }
```

**Error Responses**:
- **400** — Missing/invalid `Content-Type` or invalid JSON body.
- **409 Conflict** — Config already exists and `overwrite` is not `true`.
  ```json
  { "error": "Config already exists. Edit .config.json manually or pass overwrite: true to replace." }
  ```
- **500** — Failed to write file (permissions or path).

**Notes**: See [Setup Guide](./setup-guide.md) for full first-run instructions.

---

### 1. Setup Status

**Endpoint**: `GET /api/setup-status`

**Description**: Returns whether `.config.json` exists yet. Used by the first-run setup flow.

**Response** (200 OK):
```json
{ "hasConfig": true }
```

---

### 2. System Autocomplete

**Endpoint**: `GET /api/systems`

**Description**: System name suggestions for autocomplete, backed by the EDSM API.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Partial system name (minimum 2 characters) |

**Example Request**:
```http
GET /api/systems?q=Lave
```

**Response** (200 OK):
```json
[
  {
    "name": "Lave",
    "coords": {
      "x": 0.0,
      "y": 0.0,
      "z": 0.0
    }
  },
  {
    "name": "Lave Station",
    "coords": {
      "x": 0.0,
      "y": 0.0,
      "z": 0.0
    }
  }
]
```

**Response Headers**:
- `Content-Type: application/json`
- `Cache-Control: public, max-age=300` (5 minutes)

**Error Responses**:

- **500 Internal Server Error**: EDSM API failure
  ```json
  {
    "error": "Failed to fetch systems"
  }
  ```

**Notes**:
- Results are cached for 15 minutes in memory
- Returns empty array `[]` if query is less than 2 characters
- The endpoint itself doesn't sort results (order comes straight from EDSM); relevance sorting happens client-side in the autocomplete component

---

### 3. System Lookup

**Endpoint**: `GET /api/system-lookup`

**Description**: Checks whether a system name exists in EDSM and returns its info - useful for validating manually entered names.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | System name to verify |

**Example Request**:
```http
GET /api/system-lookup?name=Sol
```

**Response** (200 OK - Found):
```json
{
  "found": true,
  "system": {
    "name": "Sol",
    "coords": {
      "x": 0.0,
      "y": 0.0,
      "z": 0.0
    },
    "allegiance": "Federation",
    "government": "Democracy"
  }
}
```

**Response** (200 OK - Not Found):
```json
{
  "found": false,
  "system": null,
  "message": "System \"InvalidSystem\" not found in EDSM database"
}
```

**Error Responses**:

- **400 Bad Request**: Missing system name
  ```json
  {
    "error": "System name is required",
    "found": false,
    "system": null
  }
  ```

- **500 Internal Server Error**: Lookup error
  ```json
  {
    "error": "Failed to lookup system"
  }
  ```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `found` | boolean | Whether system was found in EDSM |
| `system` | object \| null | System object if found, null otherwise |
| `message` | string | Human-readable message (only if not found) |

**System Object** (when found):

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Exact system name (case-corrected) |
| `coords` | object | 3D coordinates (x, y, z) |
| `allegiance` | string \| undefined | System allegiance (if available) |
| `government` | string \| undefined | System government type (if available) |

**Notes**:
- Case-insensitive lookup
- Results are cached (in-memory + disk)
- Used by SystemInput component for validation
- Returns exact system name for case correction

---

### 4. Rare Goods Scan

**Endpoint**: `POST /api/rares-scan`

**Description**: Runs every rare good against the current system - computes distance and evaluates legality for each.

**Request Body**:

```typescript
interface ScanRequest {
  current: string;              // Current system name (required)
  currentPpType: PpSystemType; // Always "none" (PowerPlay calculations disabled)
  power: string;                // Pledged power name (optional, for Finance Ethos detection)
  hasFinanceEthos: boolean;     // Automatically determined from power selection
}
```

**Example Request**:
```http
POST /api/rares-scan
Content-Type: application/json

{
  "current": "Lave",
  "currentPpType": "none",
  "power": "Jerome Archer",
  "hasFinanceEthos": true
}
```

**Response** (200 OK):
```json
[
  {
    "rare": "Lavian Brandy",
    "originSystem": "Lave",
    "originStation": "Lave Station",
    "pad": "L",
    "sellHintLy": 160,
    "distanceToStarLs": 288,
    "cost": 3500,
    "permitRequired": false,
    "distanceFromCurrentLy": 0.0,
    "systemNotFound": false,
    "legal": true,
    "legalReason": "Legal",
    "legalityDetails": {
      "superpowerRestrictions": [],
      "illegalGovernments": [],
      "combinedRestrictions": [],
      "legalGovernments": ["Anarchy", "Communism", "Confederacy", "Cooperative", "Corporate", "Democracy", "Dictatorship", "Feudal", "Patronage", "Prison", "Prison Colony", "Theocracy"],
      "explanation": "Legal in all systems and government types"
    },
    "ppEligible": false,
    "cpDivisors": null
  },
  {
    "rare": "Altairian Skin",
    "originSystem": "Altair",
    "originStation": "Solo Orbiter",
    "pad": "M",
    "sellHintLy": 160,
    "distanceToStarLs": 667,
    "cost": 1325,
    "permitRequired": false,
    "distanceFromCurrentLy": 16.7,
    "systemNotFound": false,
    "legal": true,
    "legalReason": "Legal",
    "legalityDetails": {
      "superpowerRestrictions": [],
      "illegalGovernments": [],
      "combinedRestrictions": [],
      "legalGovernments": ["Anarchy", "Communism", "Confederacy", "Cooperative", "Corporate", "Democracy", "Dictatorship", "Feudal", "Patronage", "Prison", "Prison Colony", "Theocracy"],
      "explanation": "Legal in all systems and government types"
    },
    "ppEligible": false,
    "cpDivisors": null
  }
]
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `rare` | string | Name of the rare good |
| `originSystem` | string | System where rare originates |
| `originStation` | string | Station where rare can be purchased |
| `pad` | string \| undefined | Landing pad size required: "S", "M", or "L" |
| `sellHintLy` | number \| undefined | Optimal selling distance in lightyears |
| `distanceToStarLs` | number \| undefined | Distance from arrival star to station in light seconds |
| `cost` | number \| undefined | Typical market cost in credits |
| `permitRequired` | boolean \| undefined | Whether the system requires a permit |
| `distanceFromCurrentLy` | number | Distance from current system to origin (lightyears) |
| `systemNotFound` | boolean \| undefined | True if origin system coordinates couldn't be found in EDSM |
| `legal` | boolean | Whether rare is legal at current system |
| `legalReason` | string | Human-readable legality explanation |
| `legalityDetails` | object \| undefined | Detailed legality information (see LegalityDetails below) |
| `ppEligible` | boolean | Always false (PowerPlay calculations disabled) |
| `cpDivisors` | object \| null | Always null (PowerPlay calculations disabled) |

**LegalityDetails Object**:

| Field | Type | Description |
|-------|------|-------------|
| `superpowerRestrictions` | string[] | Superpowers where illegal (all government types) |
| `illegalGovernments` | string[] | Government types where illegal (all superpowers) |
| `combinedRestrictions` | Array<{superpower: string, government: string}> | Specific superpower + government combinations where illegal |
| `legalGovernments` | string[] | Government types where legal (all except those in illegalGovernments) |
| `explanation` | string | Human-readable explanation of all restrictions |

**CpDivisors Object**:

| Field | Type | Description |
|-------|------|-------------|
| `divisor` | number | Base CP divisor (5333) |
| `divisorWithFinanceEthos` | number | CP divisor with finance ethos (3555) |
| `effective` | number | Effective divisor based on `hasFinanceEthos` flag |

**Error Responses**:

- **400 Bad Request**: Missing or invalid current system
  ```json
  {
    "error": "Current system is required"
  }
  ```

- **400 Bad Request**: System not found in EDSM
  ```json
  {
    "error": "Could not find coordinates for current system"
  }
  ```

- **500 Internal Server Error**: Processing error
  ```json
  {
    "error": "Failed to scan rares"
  }
  ```

**Notes**:
- Processes all rare goods in the dataset
- Rare origin systems use cached data (from `data/rareSystemsCache.json`) for faster responses
- User-entered current system uses live EDSM API lookup
- Results are sorted by distance (closest first)
- PowerPlay calculations are disabled (`currentPpType` is always "none")
- Finance Ethos is automatically determined from the `power` parameter
- Optional fields (pad, cost, etc.) may be `undefined` if not available in dataset
- `systemNotFound` flag helps distinguish between "at origin" (distance 0) vs "system not found" (also distance 0)

---

## Type Definitions

### PpSystemType

```typescript
type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";
```

### ScanResult

```typescript
interface ScanResult {
  rare: string;
  originSystem: string;
  originStation: string;
  pad?: string;                          // Landing pad size: "S", "M", or "L"
  sellHintLy?: number;                   // Optimal selling distance (lightyears)
  distanceToStarLs?: number;             // Distance from star to station (light seconds)
  cost?: number;                          // Typical market cost (credits)
  permitRequired?: boolean;               // Whether system requires permit
  distanceFromCurrentLy: number;          // Distance from current to origin (lightyears)
  systemNotFound?: boolean;              // True if origin system not found in EDSM
  legal: boolean;
  legalReason: string;
  legalityDetails?: LegalityDetails;     // Detailed legality breakdown, see below
  ppEligible: boolean;                   // Always false (PowerPlay disabled)
  cpDivisors: CpDivisors | null;         // Always null (PowerPlay disabled)
}
```


### CpDivisors

```typescript
interface CpDivisors {
  divisor: number;                    // Base: 5333
  divisorWithFinanceEthos: number;     // With finance: 3555
  effective: number;                   // Actual divisor to use
}
```

## Rate Limiting

Currently, there are no explicit rate limits. However:
- System autocomplete results are cached for 5 minutes (HTTP cache)
- System lookups are cached permanently (disk cache)
- EDSM API calls are minimized through aggressive caching

## Error Handling

All endpoints follow these error handling principles:
- **400 Bad Request**: Invalid or missing required parameters
- **500 Internal Server Error**: Server-side processing errors
- Errors include a JSON object with an `error` field containing a human-readable message

## Caching

- **Rare Origin Systems**: Pre-generated cache file (`data/rareSystemsCache.json`)
  - Loaded on application startup
  - Used for all rare origin system lookups
  - Provided as pre-built cache file (`data/rareSystemsCache.json`)
- **User-Entered Systems**: In-memory cache (permanent) + disk cache (persistent)
  - Current system uses live EDSM API lookups
  - Cached after first lookup for performance
- **System Autocomplete**: HTTP cache (5 minutes) + in-memory cache (15 minutes)
- Cache-Control headers are set on the autocomplete endpoint

### 5. Curated Legality Data (Development Only)

**Endpoint**: `GET /api/curated-legality`  
**Endpoint**: `POST /api/curated-legality`  
**Endpoint**: `DELETE /api/curated-legality`

**Description**: Reads and writes manually curated legality data that overrides the base dataset. Development mode only (`import.meta.env.DEV === true`) - returns 403 Forbidden in production.

**GET Request**: Returns all curated legality data

**Response** (200 OK):
```json
{
  "Kamitra Cigars": {
    "illegalInSuperpowers": [],
    "illegalInGovs": ["Prison Colony", "Theocracy", "Corporate"],
    "illegalInSuperpowerGovs": [
      { "superpower": "Federation", "government": "Democracy" }
    ]
  }
}
```

**POST Request**: Updates curated data for a rare good

**Request Body**:
```json
{
  "rareName": "Kamitra Cigars",
  "data": {
    "illegalInSuperpowers": [],
    "illegalInGovs": ["Prison Colony", "Theocracy", "Corporate"],
    "illegalInSuperpowerGovs": [
      { "superpower": "Federation", "government": "Democracy" }
    ]
  }
}
```

**DELETE Request**: Removes curated data for a rare good (reverts to base data)

**Request Body**:
```json
{
  "rareName": "Kamitra Cigars"
}
```

**Security Note**: These endpoints are restricted to development mode only. In production, all requests return 403 Forbidden.

### 6. Market Data

**Endpoint**: `GET /api/market-data`

**Description**: Market data for rare goods stations - reads from the cached EDSM data (`data/edsmMarketData.json`, built by `npm run fetch:market`). If the requested system/station (or rare name) isn't found in the cache and the cache as a whole is stale (see `cacheFresh`), falls back to a live EDSM API call. A stale cache that still contains the requested entry is returned as-is, without a live lookup.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `system` | string | Conditional | System name (required if `station` provided) |
| `station` | string | Conditional | Station name (required if `system` provided) |
| `rare` | string | Optional | Rare good name (filters to specific commodity) |

**Examples**:

Get market data for specific station and rare good:
```http
GET /api/market-data?system=Lave&station=Lave Station&rare=Lavian Brandy
```

Get all market data for a station:
```http
GET /api/market-data?system=Lave&station=Lave Station
```

Get market data by rare good name:
```http
GET /api/market-data?rare=Lavian Brandy
```

Get all cached market data:
```http
GET /api/market-data
```

**Response** (200 OK):
```json
{
  "found": true,
  "system": "Lave",
  "station": "Lave Station",
  "rare": "Lavian Brandy",
  "data": {
    "name": "Lavian Brandy",
    "buyPrice": 0,
    "sellPrice": 0,
    "stock": 0,
    "stockBracket": 0,
    "demand": 0,
    "demandBracket": 0
  },
  "timestamp": "2026-01-12T11:45:00.000Z",
  "source": "cache",
  "cacheFresh": true,
  "metadata": {
    "fetchedAt": "2026-01-12T12:00:00.000Z",
    "totalRares": 142,
    "fetchedCount": 142,
    "successCount": 10,
    "errorCount": 130,
    "skippedCount": 2
  }
}
```

**Response Fields**:
- `found`: Boolean indicating if data was found
- `system`: System name (if specified)
- `station`: Station name (if specified)
- `rare`: Rare good name (if specified)
- `data`: Market commodity data or full station market data
- `timestamp`: When this specific cache entry was recorded (only present for a specific system+station+rare match)
- `source`: Data source ("cache" or "live")
- `cacheFresh`: Boolean indicating if cache is fresh (<12 hours old)
- `metadata`: Cache metadata - `fetchedAt`, `totalRares`, `fetchedCount`, `successCount`, `errorCount`, `skippedCount` (see `EDSMCacheMetadata` in `src/lib/edsmMarketCache.ts`)

**Note**: Market data depends on player contributions via EDMC. Data may not always be available or up-to-date for all stations.

### 7. Price Curation (Development Only)

**Endpoints**: `GET /api/curated-prices`, `POST /api/curated-prices`, `DELETE /api/curated-prices`

**Description**: Manage baseline purchase prices, shown as the estimated cost for each rare good. Development mode only.

These endpoints only work under `npm run dev` - they return 403 Forbidden in production builds.

#### GET /api/curated-prices

Returns all curated price data.

**Response** (200 OK):
```json
{
  "Lavian Brandy": {
    "cost": 5000
  },
  "Centauri Mega Gin": {
    "cost": 4500
  }
}
```

#### POST /api/curated-prices

Updates or adds curated price data for a rare good.

**Request Body**:
```json
{
  "rareName": "Lavian Brandy",
  "data": {
    "cost": 5000
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "rareName": "Lavian Brandy",
  "data": {
    "cost": 5000
  }
}
```

**Validation**:
- `rareName` is required
- `cost` must be a non-negative number (optional - omit to remove curated entry)

#### DELETE /api/curated-prices

Removes curated price data for a rare good.

**Request Body**:
```json
{
  "rareName": "Lavian Brandy"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "rareName": "Lavian Brandy",
  "message": "Deleted"
}
```

**Price Priority**: When displaying costs, the system uses this priority:
1. **Curated baseline price** (if set) - shows "(Est.)"
2. **Static cost from rares.ts** (if exists) - shows "(Est.)"
3. **"N/A"** if none of the above

**Data Storage**: Curated prices are saved to `data/curatedPrices.json`.

### 8. Cache Status

**Endpoint**: `GET /api/cache-status`

**Description**: Metadata about cache files - when each was last updated, for display in the UI's cache status indicator.

**Response** (200 OK):
```json
{
  "rareSystems": {
    "lastUpdated": "2026-01-12T12:00:00.000Z",
    "totalSystems": 138
  },
  "marketData": {
    "fetchedAt": "2026-01-12T12:00:00.000Z",
    "totalRares": 142,
    "successCount": 10,
    "cacheFresh": true
  }
}
```

Both `rareSystems` and `marketData` are omitted entirely if the corresponding cache file doesn't exist yet.

## External Dependencies

- **EDSM API**: Used for system coordinates and information
  - Base URL: `https://www.edsm.net/api-v1`
  - Endpoints: `/systems`, `/system`
  - No authentication required

