# ED Rare Router

A standalone web application for Elite Dangerous players to plan rare goods trading routes with PowerPlay integration.

🌐 **Live Demo**: [https://edrr.netlify.app/](https://edrr.netlify.app/)

## Version

**Current Version**: unstable v1.4 (January 12, 2026) - **Unreleased**

This version includes a comprehensive dataset of 142 rare commodities, enhanced legality system with detailed restrictions, manual curation interface for development, and improved layout. All rare commodity data is static - no updates needed. Route planning is done manually by the user based on scan results.

## ⚠️ Important Disclaimers

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

**NO WARRANTIES OR GUARANTEES ARE PROVIDED**

This project is:
- **A personal hobby project** - Not a commercial product
- **In active development** - Still in design and prototyping phase
- **Not ready for production use** - Not ready for Alpha or Beta testing
- **Subject to frequent changes** - Refactors and breaking changes may occur

**By using this software, you acknowledge that:**
- The software is provided "AS IS" without warranty of any kind
- No guarantees are made regarding accuracy, reliability, or fitness for any purpose
- You assume all risks associated with using this software
- The authors and contributors are not liable for any damages arising from use of this software

**Important Notes:**
- Refactors are going to happen frequently
- Documentation will be kept updated
- Code is commented
- Features may be incomplete, unstable, or subject to significant changes

This software is licensed under the **GNU General Public License v3.0**, which includes warranty disclaimers. See the [LICENSE](./LICENSE) file for full terms.

## Overview

ED Rare Router helps commanders:
- Quickly scan for rare goods near their current location
- Find rare goods origins and calculate distances from current system
- Evaluate legality of rare goods in different systems with detailed restrictions
- View comprehensive legality information (which governments allow/disallow each item)
- Build routes manually from scan results (all data is static - no updates needed)

## Tech Stack

- **Astro** - Main framework for server-side rendering and API routes
- **TypeScript** - Type-safe development throughout
- **React** - Interactive UI components (islands)
- **TailwindCSS** - Utility-first CSS framework for styling
- **EDSM API** - External data source for system information

See the [Technical Design Document](./docs/technical-design.md) for detailed architecture information.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

   This installs all required packages including `tsx` (needed for utility scripts).

3. (Optional) Provide `data/rareSystemsCache.json` for faster performance:

   The application uses a pre-built cache file (`data/rareSystemsCache.json`) containing system coordinates for all rare origin systems. This reduces API calls during runtime.
   
   **Note**: 
   - The application will work without this cache (it falls back to API lookups), but performance will be slower
   - The cache file should be committed to your repository for deployments
   - This is a one-time setup - the cache is static and doesn't need updates

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

## Building for Production

Build the production-ready site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This application uses Astro's server mode and requires a server adapter for deployment. The Netlify adapter is already installed and configured.

🌐 **Live Site**: [https://edrr.netlify.app/](https://edrr.netlify.app/)

For detailed deployment instructions, see the [Deployment Guide](./docs/deployment-guide.md).

**Quick Start (Netlify - Recommended):**
1. Ensure `data/rareSystemsCache.json` is included in your repository (optional but recommended)
2. Connect your repository to Netlify
3. Netlify will auto-detect settings from `netlify.toml`
4. The build command in `netlify.toml` automatically handles adapter configuration

**Important:** The `netlify.toml` file is already configured correctly. Do not add `@astrojs/netlify` as a plugin - it's an Astro adapter configured in `astro.config.netlify.mjs`, not a Netlify build plugin.

**Note:** For local development, keep using `@astrojs/node` adapter. The Netlify adapter is only used during deployment builds.

## Documentation

Complete project documentation is available in the following locations:

### Root Documentation
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and change log

### Technical Documentation (`/docs`)
- **[Documentation Index](./docs/README.md)** - Overview of all documentation
- **[Technical Design Document](./docs/technical-design.md)** - Architecture, design decisions, and technical specifications
- **[API Documentation](./docs/api-documentation.md)** - Complete API endpoint specifications
- **[Architecture Overview](./docs/architecture-overview.md)** - System architecture and data flow diagrams
- **[Data Appendix](./docs/data-appendix.md)** - Data structures and static datasets
- **[Deployment Guide](./docs/deployment-guide.md)** - Step-by-step deployment instructions

**Note:** Only `README.md` and `CHANGELOG.md` are maintained in the repository root. All other documentation lives in the `/docs` directory.

## Project Structure

```
/
  README.md
  CHANGELOG.md
  docs/
  src/
    pages/
      index.astro
      api/
        systems.ts
        rares-scan.ts
        system-lookup.ts
    components/
      Layout.astro
      RaresPlannerIsland.tsx
      SystemInput.tsx
      PowerInput.tsx
      ResultsList.tsx
      LegalityCurator.tsx
      CuratorApp.tsx
    data/
      rares.ts
      powers.ts
    lib/
      edsm.ts
      rareSystemsCache.ts
      distances.ts
      legality.ts
      powerplay.ts
      fuzzySearch.ts
      curatedLegality.ts
    pages/
      curate.astro (development only)
    types/
      rares.ts
      edsm.ts
      api.ts
  scripts/
  data/
    rareSystemsCache.json (generated)
    systemCache.json (generated)
    curatedLegality.json (generated, development only)
  styles/
    global.css
```

## How to Use

### Basic Usage

1. **Enter Your Current System**: Type the name of the system you're currently in. The system autocomplete will help you find the correct name.

2. **Select Your Pledged Power (Optional)**:
   - Enter the name of the PowerPlay power you're pledged to
   - Finance Ethos is automatically detected from your power selection
   - If your power has Finance Ethos, a green message will appear showing the CP divisor reduction
   - Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval

3. **Click "Scan Nearby Rares"**: The app will calculate distances and legality for all 142 rare commodities.

### Understanding Results

- **Results are sorted by distance** (closest first)
- Each rare shows:
  - **Distance** from your current system to the rare's origin
  - **Legality status** at your current system:
    - **Green "Legal"** = Legal in all systems
    - **Red "Illegal"** = Illegal in all systems
    - **Yellow "Conditional"** = Legal in some systems, illegal in others (see details)
  - **Expandable Legality Details** showing which governments/superpowers restrict the item
  - **Pad size**, **cost**, **permit requirements**, and other details
- **Back to Top button** appears at the end of results for easy navigation

### Pagination

- By default, all results are shown
- Enable "Paginate by Distance" to view results in distance ranges
- Choose from 9 page size options: 25, 50, 75, 100, 150, 200, 250, 500, or 1000 light years
- Useful for large result sets or focusing on specific distance ranges

### Finance Ethos

Finance Ethos is automatically determined from your selected power - no checkbox needed! When you select a power with Finance Ethos, a green message appears confirming it's active. Powers with Finance Ethos:
- **Denton Patreus** (Empire)
- **Jerome Archer** (Federation)
- **Li Yong-Rui** (Independent)
- **Zemina Torval** (Empire)

## Features

- **Quick Scan** - Single button to scan for all rare goods near your current system
- **System Autocomplete** - Search for systems using EDSM API with intelligent caching
- **Distance Calculations** - Compute lightyear distances between systems
- **Enhanced Legality Evaluation** - Comprehensive legality checking with detailed restrictions
  - Three-state legality display (Always Legal, Always Illegal, Conditional)
  - Detailed information about which governments allow/disallow each item
  - Support for combined superpower + government restrictions (e.g., "Federal Democracy")
  - Expandable legality details for each rare good
- **Power Autocomplete** - Fuzzy search for PowerPlay powers with faction badges
- **Distance-Based Pagination** - Optional pagination with 9 page size options (25-1000 ly)
- **Comprehensive Rare Goods Display** - Shows pad size, cost, permit requirements, and legality
- **142 Rare Commodities** - Complete dataset including all major rare goods from Elite Dangerous
- **Static Data** - All rare commodity data is static (locations never change - no updates needed)
- **Manual Route Planning** - Users build routes manually from scan results
- **Smart Sorting** - Results sorted closest first, with unknown systems at the end
- **Finance Ethos Auto-Detection** - Automatically determines Finance Ethos from selected power
- **Vertical Layout** - Selector panel above results on all screen sizes
- **Back to Top Navigation** - Button at end of results for easy navigation
- **Footer with Copyright** - Dynamic copyright year in page footer
- **Development Curation Tools** - Manual legality data curation interface (development mode only)

For detailed feature documentation, see the [API Documentation](./docs/api-documentation.md) and [Technical Design Document](./docs/technical-design.md).

## Author

**R.W. Harper - Easy Day Gamer**

- LinkedIn: [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)

## License

This project is licensed under the **GNU General Public License v3.0**.

**Important**: This license includes warranty disclaimers. The software is provided "AS IS" without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.

See the [LICENSE](./LICENSE) file for the full license text.

For more information about GPL v3.0, visit: [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
