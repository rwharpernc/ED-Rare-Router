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

## [unstable v1.3] - 2025-12-08

### Added
- **Live deployment link** - Added Netlify deployment URL to README
  - Live demo link prominently displayed at top of README
  - Deployment section includes live site link
  - Site available at: https://edrr.netlify.app/
- **Comprehensive rare goods dataset** - Expanded from 36 to 142 rare commodities
  - Added 106 new rare goods from Inara data
  - Includes all major rare commodities from Elite Dangerous
  - Complete system and station information with distance to star data
- **Enhanced pagination options** - More granular distance-based pagination
  - Added page size options: 25, 50, 75, 100, 150, 200, 250, 500, 1000 light years
  - Better control over result viewing for large datasets
- **Improved result sorting** - Closest rares shown first
  - Results sorted by distance (closest to furthest)
  - Systems with unknown coordinates placed at end
- **Finance Ethos auto-detection** - Automatically determined from selected power
  - Finance Ethos checkbox removed - now auto-detected from power selection
  - Green info box appears when Finance Ethos is active
  - Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval
- **Back to Top button** - Navigation button at end of results list
  - Smooth scroll to top of page
  - Appears after all results are displayed
- **Footer with dynamic copyright** - Footer added to all pages
  - Dynamic year updates automatically
  - Includes Elite Dangerous trademark notice

### Changed
- **Simplified UI** - Removed PowerPlay System Type dropdown
  - PowerPlay calculations disabled (always set to "none")
  - Cleaner, simpler configuration form
  - Only Current System and Pledged Power inputs remain
- **Simplified CP Divisor display** - Clearer, less confusing presentation
  - Shows effective divisor prominently (large, bold)
  - Color-coded: green when Finance Ethos active, yellow otherwise
  - Contextual information about Finance Ethos status
- **Updated station names** - Corrected station names from Inara data
  - Fixed "Alya Body Soap" (was "Alya Body Soup")
  - Updated "Chateau De Aegaeon" station to "Schweickart Station"
  - Updated "HIP 118311 Swarm" station to "Lubbock Market"
  - Updated "HIP Proto-Squid" (was "HIP 41181 Ale") with correct station
  - Updated "Aganippe Rush" station to "Julian Market"
  - Updated "Kachirigin Filter Leeches" station to "Nowak Orbital"
  - Updated "Eshu Umbrellas" station to "Shajn Terminal"
  - Updated "Rapa Bao Snake Skins" station to "Flagg Gateway"
  - Updated "Terra Mater Blood Bores" station to "GR8Minds"
  - Updated "Vanayequi Ceratomorpha Fur" station to "Clauss Hub"
  - Updated "Ngadandari Fire Opals" station to "Napier Terminal"
  - Updated "Wulpa Hyperbore Systems" station to "Williams Gateway"
- **Added distance to star data** - All rares now include distance from arrival star to station

### Fixed
- Result sorting now properly places closest rares first
- Systems with missing coordinates no longer appear at the top of results

## [unstable v1.2] - 2025-12-08

### Added
- **Quick scan functionality** - Find rare goods near your current system
- **Static rare goods dataset** - All rare commodity data is static (no updates needed)
- **PowerPlay 2.0 integration** - Full CP divisor calculations for profit-based trading
- **Legality evaluation** - Check if rares are legal in different systems
- **Distance calculations** - Compute distances from current system to rare origins
- **System autocomplete** - Search for systems using EDSM API with intelligent caching
- **Power autocomplete** - Fuzzy search for PowerPlay powers with faction badges
- **Two-column responsive layout** - Form on left, results on right (stacks on mobile)
- **Dark theme UI** - Modern, clean interface with TailwindCSS
- **Distance-based pagination** - Optional pagination by light-year ranges
- **Comprehensive documentation** - Complete technical and API documentation

### Features
- **Static Data Philosophy**: All rare commodity data is static - locations never change
- **Quick & Simple**: Single scan button, no complex route planning
- **PowerPlay Ready**: Full PowerPlay 2.0 CP calculations preserved
- **Manual Route Planning**: Users build routes manually from scan results
- **No Maintenance**: No scripts or data updates needed - everything is static

### Technical Stack
- **Astro 5.x** - Framework for server-side rendering and API routes
- **TypeScript** - Type-safe development throughout
- **React 19.x** - Interactive UI components (islands)
- **TailwindCSS 4.x** - Utility-first CSS framework
- **EDSM API** - External data source for system information

### Data Model
- **Rare Goods**: Static dataset with system, station, pad, price, legality, distance, PowerPlay info
- **PowerPlay Powers**: Complete list of 12 PowerPlay 2.0 powers with faction information
- **System Cache**: Optional pre-built cache file for rare origin system coordinates

### API Endpoints
- `GET /api/systems` - System autocomplete
- `GET /api/system-lookup` - System validation
- `POST /api/rares-scan` - Scan for nearby rare goods

### Removed
- Analyze/route planning mode (users plan routes manually)
- Dynamic data fields (stationState, allocation)
- HTML processing scripts (one-off comparison only)
- Rare systems fetch script (cache file provided pre-built)
- All maintenance/update scripts

### Philosophy
This application focuses on **static route planning data**:
- Rare commodities are always found in the same places
- No need to keep data updated
- Quick and easy tool for building routes based on distance
- PowerPlay functionality fully preserved
- Route planning done manually by user from scan results
