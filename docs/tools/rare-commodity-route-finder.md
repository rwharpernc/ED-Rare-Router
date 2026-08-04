# Route Ordering — Future Design Notes (Not Implemented)

**Status: not implemented in ED Rare Router.** Route planning here is manual by design - the app scans, calculates distance/legality/PowerPlay, and you build the route yourself from the results (see the main [README](../../README.md#overview)). This document is speculative design material for an *automatic* route-ordering feature, adapted from a sibling project's approach, kept here in case that TODO item ("Better route planning") is ever picked up. Nothing on this page describes current app behavior.

---

## The idea: "along the way" vs. greedy ordering

If the app ever grows an optional "dropoff system" field, one way to order pickup stops between the current system and the dropoff:

- **When a dropoff is set:** order pickups **along the line** from current system to dropoff (project each rare's origin system onto that line, sort by the projection parameter **t**). Resulting route: start → pickups (in t order) → dropoff.
- **When no dropoff:** fall back to **greedy closest-first** - repeatedly pick the nearest unvisited pickup system.

The math for "along the way": for vector **V** = dropoff − start and **W** = system − start, **t** = dot(W, V) / dot(V, V). The sibling project (WaystationAlpha-2026) implements this as `projectOntoLine(point, start, end)` - there is no equivalent module in this codebase today.

## If this gets built

Relevant existing pieces to build on: `src/pages/api/rares-scan.ts` already returns each rare's origin system and distance from the current system, and `src/data/rares.ts` is the single source of truth for rare data (see the [Curation Guide](./rare-commodity-curation-guide.md) for adding/editing rares and the scripts that keep coordinates/links up to date).
