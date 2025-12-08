# Changelog

All notable changes to this project will be documented in this file.

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses a three-tier versioning system: **unstable**, **beta**, and **release**.

## Versioning System

- **unstable**: Development versions with active changes and potential breaking changes
- **beta**: Feature-complete versions undergoing testing and refinement
- **release**: Stable production-ready versions

## [unstable v1.1] - 2025-12-08

### Added
- **Distance-based pagination** for results display
  - Paginate results by light-year distance ranges (50, 100, 200 ly options)
  - Shows distance range and page information
  - Automatically includes distance-0 results (at origin) on page 1
- **Enhanced result display** with additional fields
  - Landing pad size (S/M/L)
  - Optimal sell distance (sellHintLy)
  - Distance to star in light seconds (Ls)
  - Allocation cap
  - Market cost in credits
  - Permit requirement indicator
  - Station/system state (Boom, Expansion, etc.)
- **Rare origin systems cache** for improved performance
  - Pre-fetched system data stored in `data/rareSystemsCache.json`
  - Script to fetch all rare origin systems: `npm run fetch-rare-systems`
  - Cache library (`src/lib/rareSystemsCache.ts`) for loading cached data
  - Rare origin systems use cache, user-entered systems still use live API
- **System not found detection** and display
  - `systemNotFound` flag in API responses to distinguish between "at origin" (distance 0) vs "system not found"
  - Visual indicators: "You are here" (green) for at origin, "Unknown (system not found)" (yellow) for missing systems
- **Default search system** set to "Sol"
- **Enhanced route planning explanation** with detailed bullet points
- **Scripts directory** with fetch utility and documentation

### Changed
- **Results display** now shows comprehensive rare goods information matching edtools.cc format
- **Results grid layout** changed from 3 columns to 2 columns on medium+ screens (1 column on mobile)
- **Pagination behavior** changed to optional - all results shown by default
  - Distance-based pagination is now opt-in via "Paginate by Distance" checkbox
  - All rares are always included in results; pagination only filters the view
  - Page size selector and navigation controls only appear when pagination is enabled
- **API responses** include additional optional fields (pad, sellHintLy, distanceToStarLs, allocation, cost, permitRequired, stationState)
- **Rare goods dataset** updated with verified system names
  - Fixed "Aepyornis Egg" system: `Aepyornis` → `47 Ceti` (station: `Glushko Station`)
  - Fixed "Pantaa Prayer Sticks" system: `Pantaa` → `George Pantazis` (station: `Zamka Platform`)
  - Added "Gerasian Gueuze Beer" with correct station: `Yurchikhin Port`
  - Added "Centauri Mega Gin" as verified entry
- **API endpoints** now use cached data for rare origin systems, falling back to API if cache miss
- **ResultsList component** filters out invalid results and shows helpful warnings
- **Pagination logic** improved to handle edge cases (all zero distances, empty pages)

### Fixed
- Fixed blank page issue in route planning mode
- Fixed distance display showing 0.00 ly for systems that don't exist
- Fixed pagination filtering out all results when distances are valid
- Removed placeholder entries with invalid system names
- Improved error handling for missing system coordinates

### Removed
- Removed placeholder entries (PH prefix) from rare goods dataset
- Removed invalid system names that don't exist in EDSM

## [unstable v1.0] - 2025-12-07

### Added
- Initial project setup with Astro, TypeScript, React, and TailwindCSS
- Server-side rendering support with Astro server mode
- Node.js adapter for server deployment
- Netlify adapter support for serverless deployment
- System autocomplete functionality using EDSM API
- Enhanced EDSM client with multi-layer caching system
  - In-memory cache with TTL for system searches (15 minutes)
  - Persistent disk-backed cache for system lookups (`data/systemCache.json`)
  - Debounced disk writes (5-second delay) to reduce I/O
  - User-Agent header for polite API usage
  - 10-second timeout for fetch requests
- Rare goods scanning mode
- Rare goods analysis mode with route planning
- Distance calculation between systems
- Legality evaluation for rare goods
- PowerPlay CP divisor calculations
- PowerPlay 2.0 powers data with faction information
- PowerInput component with fuzzy search autocomplete
  - Case-insensitive matching
  - Faction badges (Federation, Alliance, Empire, Independent)
  - Color-coded faction display
- Complete PowerPlay 2.0 powers list (12 powers total)
- Two-column responsive layout (form left, results right)
- Dark theme UI with TailwindCSS
- TypeScript type definitions for all data models
- API endpoints for system search, scanning, and analysis
  - System lookup endpoint (`/api/system-lookup`) for validation
  - Cache-Control headers on system autocomplete endpoint
- React components for interactive UI
- Enhanced API error handling with detailed error messages
- Content-Type validation for API requests
- Improved system validation with case-insensitive matching
- Better closure handling in async validation functions
- Comprehensive deployment documentation
- Netlify deployment configuration
- Documentation structure with `/docs` directory

### Changed
- Configured Astro for server mode (`output: 'server'`)
- API endpoints now marked as server-rendered (`prerender = false`)
- Improved JSON parsing error handling in API routes
- Enhanced system input validation to prevent 400 errors
- Better error messages for debugging API issues
- Improved fuzzy search algorithm for power autocomplete
  - More precise matching (removed overly lenient prefix matching)
  - Better relevance scoring
- Enhanced EDSM integration with error handling and graceful degradation

### Fixed
- Fixed 400 errors when validating system names (closure issue)
- Fixed "Unexpected end of JSON input" errors in API routes
- Fixed POST request handling in static mode (now requires server mode)
- Improved system name validation to handle case-insensitive matching correctly
- Fixed stale closure values in async validation functions
- Power autocomplete now correctly filters results (e.g., "Arc" no longer shows "Arissa")
