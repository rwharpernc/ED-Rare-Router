# Rare Commodity Data — Curation Guide

How to add, edit, and maintain rare commodities for the ED Rare Router. The data is manually curated in `src/data/rares.ts`.

---

## Files Overview

| File | Purpose |
|------|---------|
| `src/data/rares.ts` | **Single source of truth** — Add, edit, remove rares here (includes legality and PowerPlay fields) |
| `data/rare-system-coords.json` | Generated — EDSM coordinates for all rare origin systems. Regenerate after adding systems. |
| `scripts/generate-rare-coords.js` | Fetches EDSM coords and writes `data/rare-system-coords.json` |
| `scripts/update-rare-inara-links.js` | Fetches Inara’s rare commodities page and inserts/updates `inaraLink` where rare name matches |

**Important:** The coords script reads `rares.ts` and derives unique system names. No separate system list to maintain.

---

## Is the missing data available via API?

| Data | Source | How to get it |
|------|--------|----------------|
| **System coordinates** | EDSM API | ✅ Run `npm run generate:rare-coords`. Uses [EDSM API](https://www.edsm.net/en/api-v1). |
| **inaraLink** | Inara web page | ⚠️ No commodity API. Run `npm run update:rare-inara-links` to fill `inaraLink` for rares whose name matches Inara exactly. |
| **Legality (illegalInSuperpowers, illegalInGovs, illegalInSuperpowerGovs)** | Inara (manual) | ❌ No public API. Curate from [Inara rare commodities](https://inara.cz/elite/commodities-rare/) and individual commodity pages. See file header in `rares.ts`. |

---

## Filling inaraLink automatically

Run:

```bash
npm run update:rare-inara-links
```

This fetches Inara's rare commodities page and inserts or updates `inaraLink` for every rare whose name matches Inara's list. Rare names must match **exactly** (including apostrophes and spelling).

---

## Data structure (rares.ts)

Each entry is a `RareGood`: required fields are `rare`, `system`, `station`, `pad`, `sellHintLy`, `illegalInSuperpowers`, `illegalInGovs`, and `pp`. Optional: `illegalInSuperpowerGovs`, `distanceToStarLs`, `inaraLink`, `cost`, `permitRequired`. See `src/types/rares.ts` for the full type.

---

## Adding a new rare

1. Open `src/data/rares.ts`.
2. Add a new object to the `rares` array with required fields (and optional `inaraLink`, `distanceToStarLs`, etc.).
3. System names must match EDSM exactly. Use double quotes for names with apostrophes (e.g. `system: "Baltah'Sine"`).
4. Regenerate coords if you added a new system: `npm run generate:rare-coords`.
5. Optionally run `npm run update:rare-inara-links` to add Inara links.

---

## Editing or removing a rare

- **Edit:** Change fields in `rares.ts`. If you changed the system name, run `npm run generate:rare-coords`.
- **Remove:** Delete the object from `rares.ts`. Regenerate coords if that system has no other rares.

---

## Regenerating coordinates

```bash
npm run generate:rare-coords
```

Writes to `data/rare-system-coords.json` (or your configured data dir). Uses a 500 ms delay per system to respect EDSM rate limits.
