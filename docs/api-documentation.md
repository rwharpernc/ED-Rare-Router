# API Documentation

**ED Rare Router API**  
Version: unstable v1.4 (Unreleased)  
Last Updated: January 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This API is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding accuracy, reliability, availability, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this API. See the [LICENSE](../../LICENSE) file for full terms.

## Overview

The ED Rare Router API provides endpoints for system autocomplete and rare goods scanning. All endpoints return JSON and use standard HTTP status codes.

**Note**: This is a quick scan tool for finding rare goods near your current location. Route planning is done manually by the user based on scan results.

### Finance Ethos

Finance Ethos is automatically determined from the `power` parameter. Powers with Finance Ethos:
- Denton Patreus (Empire)
- Jerome Archer (Federation)
- Li Yong-Rui (Independent)
- Zemina Torval (Empire)

When a power with Finance Ethos is selected, the `hasFinanceEthos` flag is automatically set to `true`. Note: PowerPlay calculations are currently disabled (system type is always "none").

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

**Description**: Analyzes all rare goods from the current system perspective. Computes distances and evaluates legality.

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

### 4. Curated Legality Data (Development Only)

**Endpoint**: `GET /api/curated-legality`  
**Endpoint**: `POST /api/curated-legality`  
**Endpoint**: `DELETE /api/curated-legality`

**Description**: Manages manually curated legality data that overrides base data. **Only available in development mode** (`import.meta.env.DEV === true`). Returns 403 Forbidden in production.

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

## External Dependencies

- **EDSM API**: Used for system coordinates and information
  - Base URL: `https://www.edsm.net/api-v1`
  - Endpoints: `/systems`, `/system`
  - No authentication required

