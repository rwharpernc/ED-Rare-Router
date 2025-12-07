# Data Appendix

**ED Rare Router**  
Version: unstable v1.0  
Last Updated: December 7, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## Overview

This document describes the data structures and datasets used in ED Rare Router.

## Data Files

### 1. Rare Goods Dataset (`src/data/rares.ts`)

Contains static data for Elite Dangerous rare goods.

#### Structure

```typescript
interface RareGood {
  rare: string;                          // Name of the rare good
  system: string;                        // Origin system name
  station: string;                       // Origin station name
  pad: "S" | "M" | "L";                 // Landing pad size required
  sellHintLy: number;                    // Optimal selling distance (lightyears)
  illegalInSuperpowers: string[];        // Superpowers where illegal
  illegalInGovs: string[];                // Government types where illegal
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
  illegalInSuperpowers: [],
  illegalInGovs: [],
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
- **`illegalInSuperpowers`**: Array of superpower names where the rare is illegal
  - Common values: `"Federation"`, `"Empire"`, `"Alliance"`
- **`illegalInGovs`**: Array of government types where the rare is illegal
  - Common values: `"Anarchy"`, `"Dictatorship"`, etc.
- **`pp.eligibleSystemTypes`**: PowerPlay system types where the rare can generate CP
  - `"acquisition"`: Acquisition systems
  - `"exploit"`: Exploit systems

#### Dataset Statistics

- **Total Rare Goods**: 33 (as of unstable v1.0)
  - 30 confirmed rare goods
  - 3 placeholder entries (prefixed with "PH")

#### Placeholder Entries

Entries prefixed with "PH" are placeholders that may need verification:
- `PH Centauri Mega Gin`
- `PH Pantaa Prayer Sticks`
- `PH Gerasian Gueuze Beer`

These entries include a `notes` field indicating what needs verification.

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

interface AnalyzeRequest {
  current: string;
  target: string;
  targetPpType: PpSystemType;
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

### System Cache (`data/systemCache.json`)

Generated at runtime, contains cached EDSM system data.

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
4. Update placeholder entries as data is verified

### Updating PowerPlay Powers

1. Edit `src/data/powers.ts`
2. Update the `powerplayPowers` array
3. Ensure faction assignments are correct
4. Test fuzzy search functionality

### Cache Management

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

