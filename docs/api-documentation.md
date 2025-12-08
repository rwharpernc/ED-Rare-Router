# API Documentation

**ED Rare Router API**  
Version: unstable v1.1  
Last Updated: December 8, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## Overview

The ED Rare Router API provides three endpoints for system autocomplete and rare goods analysis. All endpoints return JSON and use standard HTTP status codes.

## Base URL

All endpoints are relative to the application root:
- Development: `http://localhost:4321`
- Production: `https://your-domain.com`

## Endpoints

### 1. System Autocomplete

**Endpoint**: `GET /api/systems`

**Description**: Provides system name suggestions for autocomplete functionality using the EDSM API.

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
- Results are sorted by relevance (exact matches first)

---

### 2. System Lookup

**Endpoint**: `GET /api/system-lookup`

**Description**: Verifies if a system name exists in EDSM and returns system information. Useful for validating manually entered system names.

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

### 3. Rare Goods Scan

**Endpoint**: `POST /api/rares-scan`

**Description**: Analyzes all rare goods from the current system perspective. Computes distances, evaluates legality, and determines PowerPlay eligibility.

**Request Body**:

```typescript
interface ScanRequest {
  current: string;              // Current system name (required)
  currentPpType: PpSystemType; // "acquisition" | "exploit" | "reinforcement" | "none"
  power: string;                // Pledged power name (optional, for reference)
  hasFinanceEthos: boolean;     // Finance ethos bonus flag
}
```

**Example Request**:
```http
POST /api/rares-scan
Content-Type: application/json

{
  "current": "Lave",
  "currentPpType": "acquisition",
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
    "allocation": 24,
    "cost": 3500,
    "permitRequired": false,
    "stationState": null,
    "distanceFromCurrentLy": 0.0,
    "systemNotFound": false,
    "legal": true,
    "legalReason": "Legal",
    "ppEligible": true,
    "cpDivisors": {
      "divisor": 5333,
      "divisorWithFinanceEthos": 3555,
      "effective": 3555
    }
  },
  {
    "rare": "Altairian Skin",
    "originSystem": "Altair",
    "originStation": "Solo Orbiter",
    "pad": "M",
    "sellHintLy": 160,
    "distanceToStarLs": 667,
    "allocation": 63,
    "cost": 1325,
    "permitRequired": false,
    "stationState": "Boom",
    "distanceFromCurrentLy": 16.7,
    "systemNotFound": false,
    "legal": true,
    "legalReason": "Legal",
    "ppEligible": true,
    "cpDivisors": {
      "divisor": 5333,
      "divisorWithFinanceEthos": 3555,
      "effective": 3555
    }
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
| `allocation` | number \| undefined | Typical allocation cap for the commodity |
| `cost` | number \| undefined | Typical market cost in credits |
| `permitRequired` | boolean \| undefined | Whether the system requires a permit |
| `stationState` | string \| undefined | Recent system/station state (e.g., "Boom", "Expansion") |
| `distanceFromCurrentLy` | number | Distance from current system to origin (lightyears) |
| `systemNotFound` | boolean \| undefined | True if origin system coordinates couldn't be found in EDSM |
| `legal` | boolean | Whether rare is legal at current system |
| `legalReason` | string | Human-readable legality explanation |
| `ppEligible` | boolean | Whether rare is eligible for PP CP generation |
| `cpDivisors` | object \| null | CP divisor information (null if not eligible) |

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
- Results are returned in the order they appear in the dataset
- Optional fields (pad, allocation, cost, etc.) may be `undefined` if not available in dataset
- `systemNotFound` flag helps distinguish between "at origin" (distance 0) vs "system not found" (also distance 0)

---

### 4. Rare Goods Analyze

**Endpoint**: `POST /api/rares-analyze`

**Description**: Analyzes rare goods for route planning between current and target systems. Includes profit range calculations and target system legality evaluation.

**Request Body**:

```typescript
interface AnalyzeRequest {
  current: string;              // Current system name (required)
  target: string;               // Target system name (required)
  targetPpType: PpSystemType;  // "acquisition" | "exploit" | "reinforcement" | "none"
  power: string;                // Pledged power name (optional, for reference)
  hasFinanceEthos: boolean;     // Finance ethos bonus flag
}
```

**Example Request**:
```http
POST /api/rares-analyze
Content-Type: application/json

{
  "current": "Lave",
  "target": "Achenar",
  "targetPpType": "exploit",
  "power": "Jerome Archer",
  "hasFinanceEthos": false
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
    "allocation": 24,
    "cost": 3500,
    "permitRequired": false,
    "stationState": null,
    "distanceCurrentToOriginLy": 0.0,
    "distanceOriginToTargetLy": 179.5,
    "systemNotFound": false,
    "inProfitRange": true,
    "legal": true,
    "legalReason": "Legal",
    "ppEligible": true,
    "cpDivisors": {
      "divisor": 5333,
      "divisorWithFinanceEthos": 3555,
      "effective": 5333
    }
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
| `allocation` | number \| undefined | Typical allocation cap for the commodity |
| `cost` | number \| undefined | Typical market cost in credits |
| `permitRequired` | boolean \| undefined | Whether the system requires a permit |
| `stationState` | string \| undefined | Recent system/station state (e.g., "Boom", "Expansion") |
| `distanceCurrentToOriginLy` | number | Distance from current to origin (lightyears) |
| `distanceOriginToTargetLy` | number | Distance from origin to target (lightyears) |
| `systemNotFound` | boolean \| undefined | True if origin system coordinates couldn't be found in EDSM |
| `inProfitRange` | boolean | Whether target distance >= `sellHintLy` |
| `legal` | boolean | Whether rare is legal at target system |
| `legalReason` | string | Human-readable legality explanation |
| `ppEligible` | boolean | Whether rare is eligible for PP CP at target |
| `cpDivisors` | object \| null | CP divisor information (null if not eligible) |

**Error Responses**:

- **400 Bad Request**: Missing current system
  ```json
  {
    "error": "Current system is required"
  }
  ```

- **400 Bad Request**: Missing target system
  ```json
  {
    "error": "Target system is required for analyze mode"
  }
  ```

- **400 Bad Request**: System not found
  ```json
  {
    "error": "Could not find coordinates for current system"
  }
  ```

- **500 Internal Server Error**: Processing error
  ```json
  {
    "error": "Failed to analyze rares"
  }
  ```

**Notes**:
- `inProfitRange` is `true` when `distanceOriginToTargetLy >= rare.sellHintLy`
- Legality is evaluated at the target system (not current)
- PP eligibility is based on target system type
- Rare origin systems use cached data (from `data/rareSystemsCache.json`) for faster responses
- User-entered systems (current/target) use live EDSM API lookups
- Optional fields (pad, allocation, cost, etc.) may be `undefined` if not available in dataset

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
  allocation?: number;                    // Typical allocation cap
  cost?: number;                          // Typical market cost (credits)
  permitRequired?: boolean;               // Whether system requires permit
  stationState?: string;                  // System/station state (e.g., "Boom", "Expansion")
  distanceFromCurrentLy: number;          // Distance from current to origin (lightyears)
  systemNotFound?: boolean;              // True if origin system not found in EDSM
  legal: boolean;
  legalReason: string;
  ppEligible: boolean;
  cpDivisors: CpDivisors | null;
}
```

### AnalyzeResult

```typescript
interface AnalyzeResult {
  rare: string;
  originSystem: string;
  originStation: string;
  pad?: string;                          // Landing pad size: "S", "M", or "L"
  sellHintLy?: number;                   // Optimal selling distance (lightyears)
  distanceToStarLs?: number;             // Distance from star to station (light seconds)
  allocation?: number;                    // Typical allocation cap
  cost?: number;                          // Typical market cost (credits)
  permitRequired?: boolean;               // Whether system requires permit
  stationState?: string;                  // System/station state (e.g., "Boom", "Expansion")
  distanceCurrentToOriginLy: number;      // Distance from current to origin (lightyears)
  distanceOriginToTargetLy: number;       // Distance from origin to target (lightyears)
  systemNotFound?: boolean;              // True if origin system not found in EDSM
  inProfitRange: boolean;                 // Whether target distance >= sellHintLy
  legal: boolean;
  legalReason: string;
  ppEligible: boolean;
  cpDivisors: CpDivisors | null;
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
  - Generated via `npm run fetch-rare-systems` script
- **User-Entered Systems**: In-memory cache (permanent) + disk cache (persistent)
  - Current and target systems use live EDSM API lookups
  - Cached after first lookup for performance
- **System Autocomplete**: HTTP cache (5 minutes) + in-memory cache (15 minutes)
- Cache-Control headers are set on the autocomplete endpoint

## External Dependencies

- **EDSM API**: Used for system coordinates and information
  - Base URL: `https://www.edsm.net/api-v1`
  - Endpoints: `/systems`, `/system`
  - No authentication required

