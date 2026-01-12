# Data Appendix

**ED Rare Router**  
Version: unstable v1.4 (Unreleased)  
Last Updated: January 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software and its data are provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding data accuracy, completeness, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software or its data. See the [LICENSE](../../LICENSE) file for full terms.

## Overview

This document describes the data structures and datasets used in ED Rare Router.

## Data Files

### 1. Rare Goods Dataset (`src/data/rares.ts`)

Contains static data for Elite Dangerous rare goods.

#### Structure

```typescript
interface RareGood {
  rare: string;                          // Name of the rare good
  system: string;                        // Origin system name (verified in EDSM)
  station: string;                       // Origin station name
  pad: "S" | "M" | "L";                 // Landing pad size required
  sellHintLy: number;                    // Optimal selling distance (lightyears)
  illegalInSuperpowers: string[];        // Superpowers where illegal (all government types)
  illegalInGovs: string[];              // Government types where illegal (all superpowers)
  illegalInSuperpowerGovs?: Array<{      // Combined restrictions (specific combinations)
    superpower: string;
    government: string;
  }>;
  distanceToStarLs?: number;            // Distance from arrival star to station (light seconds)
  cost?: number;                         // Typical market cost in credits (static baseline)
  permitRequired?: boolean;              // Whether system requires a permit
  pp: {
    eligibleSystemTypes: Array<"acquisition" | "exploit">;
    notes?: string;                      // Optional notes
  };
}
```

#### Example Entry

```typescript
{
  rare: "Lavian Brandy",
  system: "Lave",
  station: "Lave Station",
  pad: "L",
  sellHintLy: 160,
  distanceToStarLs: 288,
  illegalInSuperpowers: [],
  illegalInGovs: ["Prison Colony"],
  illegalInSuperpowerGovs: [
    { superpower: "Federation", government: "Theocracy" },
    { superpower: "Alliance", government: "Theocracy" },
  ],
  pp: {
    eligibleSystemTypes: ["acquisition", "exploit"],
  },
}
```

#### Fields Explained

- **`rare`**: The name of the rare good as it appears in-game
- **`system`**: The system where the rare good can be purchased
- **`station`**: The specific station within that system
- **`pad`**: Minimum landing pad size required
  - `"S"`: Small pad (Sidewinder, Eagle, etc.)
  - `"M"`: Medium pad (Python, Krait, etc.)
  - `"L"`: Large pad (Anaconda, Cutter, etc.)
- **`sellHintLy`**: Optimal distance to sell the rare good for maximum profit
- **`illegalInSuperpowers`**: Array of superpower names where the rare is illegal (applies to all government types in that superpower)
  - Common values: `"Federation"`, `"Empire"`, `"Alliance"`, `"Independent"`
- **`illegalInGovs`**: Array of government types where the rare is illegal (applies regardless of superpower)
  - Common values: `"Anarchy"`, `"Prison Colony"`, `"Theocracy"`, `"Corporate"`, etc.
  - All 12 government types: Anarchy, Communism, Confederacy, Cooperative, Corporate, Democracy, Dictatorship, Feudal, Patronage, Prison, Prison Colony, Theocracy
- **`illegalInSuperpowerGovs`**: Array of combined restrictions (specific superpower + government combinations)
  - Example: `[{ superpower: "Federation", government: "Democracy" }]` means illegal in Federal Democracy systems
  - Used for cases like "Federal Theocracy" or "Alliance Theocracy" where both conditions must match
- **`pp.eligibleSystemTypes`**: PowerPlay system types where the rare can generate CP
  - `"acquisition"`: Acquisition systems
  - `"exploit"`: Exploit systems

#### Dataset Statistics

- **Total Rare Goods**: 142 (as of unstable v1.3)
  - All entries use verified system names that exist in EDSM
  - No placeholder entries
  - All data is static - locations never change
  - Comprehensive dataset includes all major rare commodities from Elite Dangerous

The following systems were corrected to match EDSM database:
- `Aepyornis Egg`: System changed from `Aepyornis` → `47 Ceti` (station: `Glushko Station`)
- `Pantaa Prayer Sticks`: System changed from `Pantaa` → `George Pantazis` (station: `Zamka Platform`)
- `Gerasian Gueuze Beer`: Station corrected to `Yurchikhin Port` (system: `Geras`)
- `Centauri Mega Gin`: Added as verified entry (system: `Alpha Centauri`, station: `Hutton Orbital`)

---

### 2. PowerPlay Powers Dataset (`src/data/powers.ts`)

Contains PowerPlay 2.0 powers with faction information.

#### Structure

```typescript
interface PowerPlayPower {
  name: string;
  faction: "Federation" | "Alliance" | "Empire" | "Independent";
}
```

#### Complete Power List (12 Powers)

**Federation (2)**:
- Felicia Winters
- Jerome Archer

**Alliance (2)**:
- Edmund Mahon
- Nakato Kaine

**Empire (4)**:
- Aisling Duval
- Arissa Lavigny-Duval
- Denton Patreus
- Zemina Torval

**Independent (4)**:
- Archon Delaine
- Li Yong-Rui
- Pranav Antal
- Yuri Grom

#### Search Function

The dataset includes a `searchPowers(query: string)` function that performs fuzzy, case-insensitive matching with relevance scoring.

**Matching Priority**:
1. Exact matches (case-insensitive)
2. Powers that start with the query
3. Powers where any word starts with the query
4. Powers that contain the query anywhere

---

## Type Definitions

### EDSM Types (`src/types/edsm.ts`)

```typescript
interface EDSMCoords {
  x: number;
  y: number;
  z: number;
}

interface EDSMSystem {
  name: string;
  coords: EDSMCoords;
  allegiance?: string;    // e.g., "Federation", "Empire", "Alliance"
  government?: string;     // e.g., "Democracy", "Anarchy", "Dictatorship"
}
```

### API Types (`src/types/api.ts`)

```typescript
type PpSystemType = "acquisition" | "exploit" | "reinforcement" | "none";

interface ScanRequest {
  current: string;
  currentPpType: PpSystemType;
  power: string;
  hasFinanceEthos: boolean;
}

interface CpDivisors {
  divisor: number;                    // Base: 5333
  divisorWithFinanceEthos: number;    // With finance: 3555
  effective: number;                  // Actual divisor to use
}
```

---

## Runtime Data

### Rare Systems Cache (`data/rareSystemsCache.json`)

Pre-generated cache file containing all rare origin system coordinates. Should be provided as a static file in the repository.

#### Structure

```json
{
  "lave": {
    "name": "Lave",
    "coords": { "x": 0, "y": 0, "z": 0 },
    "allegiance": "Alliance",
    "government": "Democracy"
  },
  "47 ceti": {
    "name": "47 Ceti",
    "coords": { "x": 1.2, "y": -3.4, "z": 5.6 },
    "allegiance": "Federation",
    "government": "Democracy"
  },
  "_metadata": {
    "lastUpdated": "2025-12-08T12:00:00.000Z",
    "totalSystems": 35
  }
}
```

#### Cache Keys

- Keys are normalized system names (lowercase, trimmed)
- Example: `"47 Ceti"` → key: `"47 ceti"`
- Metadata stored under `_metadata` key

#### Cache Behavior

- **Loading**: Cache is loaded on application startup by `src/lib/rareSystemsCache.ts`
- **Usage**: Rare origin systems use cache, user-entered systems use live API
- **Generation**: Cache file should be provided pre-built (or can be generated manually using EDSM API)
- **Persistence**: Committed to repository for faster deployments

#### Benefits

- Faster API responses (no EDSM lookups for rare origins)
- Reduced API calls (only user systems hit EDSM)
- Works even if EDSM is temporarily unavailable for rare origins
- Rate limit friendly (pre-fetched once)

---

### System Cache (`data/systemCache.json`)

Generated at runtime, contains cached EDSM system data for user-entered systems.

#### Structure

```json
{
  "lave": {
    "name": "Lave",
    "coords": { "x": 0, "y": 0, "z": 0 },
    "allegiance": "Alliance",
    "government": "Democracy"
  },
  "achenar": {
    "name": "Achenar",
    "coords": { "x": 1, "y": 2, "z": 3 },
    "allegiance": "Empire",
    "government": "Patronage"
  }
}
```

#### Cache Keys

- Keys are normalized system names (lowercase, trimmed)
- Example: `"Lave"` → key: `"lave"`

#### Cache Behavior

- **Loading**: Cache is loaded on application startup
- **Writing**: Debounced writes (5-second delay) to reduce I/O
- **Persistence**: Survives server restarts
- **TTL**: No expiration (system data is stable)

---

## Data Sources

### External APIs

- **EDSM (Elite Dangerous Star Map)**: System coordinates and information
  - Base URL: `https://www.edsm.net/api-v1`
  - Endpoints: `/systems`, `/system`
  - Documentation: https://www.edsm.net/en/api

### Static Data Sources

- **Rare Goods**: Compiled from in-game data and community resources
- **PowerPlay Powers**: Sourced from Inara.cz and official Elite Dangerous resources
  - Inara: https://inara.cz/elite/powers/
  - Official: https://www.elitedangerous.com/news/powerplay-20-qa

---

## Data Maintenance

### Updating Rare Goods

1. Edit `src/data/rares.ts`
2. Add new entries following the `RareGood` interface
3. Verify system/station names match EDSM data
4. All system names must exist in EDSM database (no placeholders)
5. **Update `data/rareSystemsCache.json`** with new system coordinates if needed
   - This is required after adding new rares or correcting system names
   - The application will work without updating the cache, but new systems will use slower API lookups

### Updating PowerPlay Powers

1. Edit `src/data/powers.ts`
2. Update the `powerplayPowers` array
3. Ensure faction assignments are correct
4. Test fuzzy search functionality

### Cache Management

#### Rare Systems Cache

- Pre-generated cache for rare origin systems
- Cache file should be provided pre-built in the repository
- **When to run**:
  - **Before first deployment** (recommended for production)
  - After adding new rare goods to the dataset
  - After correcting system names in the rare goods data
  - Periodically to refresh system data (optional)
- **Important**: The application works without this cache (falls back to API), but performance will be slower
- The cache file should be committed to the repository for deployments

#### System Cache (User Systems)

- System cache is automatically managed
- To clear cache: Delete `data/systemCache.json`
- Cache will rebuild on next system lookup

---

## Data Validation

### Rare Goods Validation

- System names should match EDSM database
- Station names should be exact (case-sensitive)
- Pad sizes must be one of: `"S"`, `"M"`, `"L"`
- `sellHintLy` should be a positive number
- Illegal arrays should contain valid superpower/government names

### PowerPlay Powers Validation

- Power names should match official PowerPlay 2.0 list
- Factions must be one of: `"Federation"`, `"Alliance"`, `"Empire"`, `"Independent"`
- All 12 PowerPlay 2.0 powers must be present

---

## Future Data Enhancements

Potential additions:
- Rare goods profit margins
- Station services (refuel, repair, etc.)
- System security levels
- Faction influence data
- Historical price data
- Trade route optimization data

