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

## [Unreleased]

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
