# Rare Commodity Route Finder — Design Notes

Technical design and concepts used in the ED Rare Router (pulled from WaystationAlpha-2026 improvements).

---

## This app (ED Rare Router)

- **Data:** `src/data/rares.ts` (single source of truth; includes legality and PowerPlay).
- **Coords:** Optional `data/rare-system-coords.json` from `npm run generate:rare-coords`; runtime also uses EDSM API and `data/rareSystemsCache.json`.
- **API:** `POST /api/rares-scan` — scan from current system; returns rares with distances, legality, PowerPlay. Route ordering can be extended with “along the way” logic when a dropoff is set (see below).

---

## Route ordering: “along the way” vs greedy

Useful when you add an optional dropoff system:

- **When a dropoff is set:** Order pickup stops **along the line** from current system to dropoff (project each rare system onto that line, sort by projection parameter **t**). Route: start → pickups (in t order) → dropoff.
- **When no dropoff:** **Greedy closest-first** — repeatedly choose the nearest unvisited pickup system.

Math for “along the way”: for vector **V** = dropoff − start and **W** = system − start, **t** = dot(W, V) / dot(V, V). Implemented in Waystation as `projectOntoLine(point, start, end)` in `src/lib/rare-route-server.ts`.

---

## Scripts (from Waystation)

| Script | Purpose |
|--------|---------|
| `npm run generate:rare-coords` | Fetch EDSM coords for all rare origin systems; write `data/rare-system-coords.json`. |
| `npm run update:rare-inara-links` | Fetch Inara rare commodities page; insert/update `inaraLink` in `rares.ts` where rare name matches. |

See [Rare Commodity Curation Guide](./rare-commodity-curation-guide.md) for adding/editing rares and field reference.
