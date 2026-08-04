# Data Appendix

**ED Rare Router**  
Version: Beta 1
Last Updated: August 3, 2026

**Author:** R.W. Harper  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software and its data are provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding data accuracy, completeness, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software or its data. See the [LICENSE](../LICENSE) file for full terms.

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

- **Total Rare Goods**: 142
  - All entries use verified system names that exist in EDSM
  - No placeholder entries
  - All data is static - locations never change
  - A couple of entries are still being cross-checked against external community references (~140 cited elsewhere) - see [Data Accuracy Notes](./data-accuracy-notes.md) and [Troubleshooting Notes](./troubleshooting-notes.md)

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
  hasFinanceEthos: boolean;
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

Optional, read-only cache file containing rare origin system coordinates. `src/lib/rareSystemsCache.ts` never writes to this file - it only reads it if present. No script in the repo currently generates it in this shape (see Cache Management below); without it, rare origin lookups fall back to live EDSM calls.

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
    "totalSystems": 138
  }
}
```

#### Cache Keys

- Keys are normalized system names (lowercase, trimmed)
- Example: `"47 Ceti"` → key: `"47 ceti"`
- Metadata stored under `_metadata` key

#### Cache Behavior

- **Loading**: Cache is loaded once, if present, by `src/lib/rareSystemsCache.ts`
- **Usage**: Rare origin systems use the cache when available; user-entered systems always use the live API (via `src/lib/edsm.ts`)
- **Generation**: No script currently produces this file in this exact shape - see Cache Management below
- **Persistence**: Not written by the app; if you build one by hand, it's gitignored like the other `data/*.json` cache files

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
5. Optionally run `npm run generate:rare-coords` to refresh `data/rare-system-coords.json` with coordinates for the new/corrected system - note this is a different file from `data/rareSystemsCache.json` (see Cache Management below)
   - The application works fine without either cache file; new/uncached systems just use a live API lookup per scan instead of an in-memory hit

### Updating PowerPlay Powers

1. Edit `src/data/powers.ts`
2. Update the `powerplayPowers` array
3. Ensure faction assignments are correct
4. Test fuzzy search functionality

### Cache Management

#### Rare Systems Cache

- `data/rareSystemsCache.json` is an optional, hand-built or future-tooling cache - the app never writes to it, and no script currently generates it in the shape `src/lib/rareSystemsCache.ts` expects (keyed by normalized system name, `EDSMSystem` values, plus `_metadata`)
- `npm run generate:rare-coords` is the closest existing tool, but it writes a different file (`data/rare-system-coords.json`, flat `{name: {x,y,z}}`, un-normalized keys, no allegiance/government/`_metadata`) - not a drop-in
- **Important**: The application works fine without `rareSystemsCache.json` - it just falls back to a live EDSM lookup per rare, per scan, instead of an in-memory hit
- Like other generated `data/*.json` files, this one is gitignored - don't commit it

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

