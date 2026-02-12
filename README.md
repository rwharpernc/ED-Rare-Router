# ED Rare Router

A standalone web application for Elite Dangerous players to plan rare goods trading routes with PowerPlay integration.


## Version

**Current Version**: unstable v1.4 (February 12, 2026) - **Unreleased**

**Note:** This version (config file, API keys, path sanitization) is not fully tested.

This version includes a comprehensive dataset of 140-142 rare commodities (still being verified), enhanced legality system with detailed restrictions, manual curation interface for development, and improved layout. All rare commodity data is static - no updates needed. Route planning is done manually by the user based on scan results.

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

## Features

### Core Functionality
- **Quick Scan** - Single button to scan for all rare goods near your current system
- **140-142 Rare Commodities** - Complete dataset including all major rare goods from Elite Dangerous (count still being verified)
- **System Autocomplete** - Search for systems using EDSM API with intelligent caching
- **Distance Calculations** - Compute lightyear distances between systems
- **Smart Sorting** - Results sorted closest first, with unknown systems at the end

### Legality System
- **Enhanced Legality Evaluation** - Comprehensive legality checking with detailed restrictions
- **Three-State Legality Display** - Always Legal, Always Illegal, or Conditional
- **Detailed Restrictions** - Shows which governments and superpowers allow/disallow each item
- **Combined Restrictions** - Support for combined superpower + government restrictions (e.g., "Federal Democracy")
- **Expandable Details** - Click to see full legality information for each rare good

### PowerPlay Integration
- **Power Autocomplete** - Fuzzy search for PowerPlay powers with faction badges
- **Finance Ethos Auto-Detection** - Automatically determines Finance Ethos from selected power
- **CP Divisor Calculation** - Shows effective CP divisors with Finance Ethos applied

### User Interface
- **Vertical Layout** - Selector panel above results on all screen sizes
- **Distance-Based Pagination** - Optional pagination with 9 page size options (25-1000 ly)
- **Comprehensive Display** - Shows pad size, cost, permit requirements, and legality
- **Back to Top Navigation** - Button at end of results for easy navigation
- **Real-Time Market Data** - Live buy/sell prices and stock information from EDDN (when worker is running)
- **Price Display with Fallbacks** - Shows prices with source indicators:
  - "(Live)" for real-time EDDN market data
  - "(Est.)" for curated baseline prices or static costs
  - Stock and sell price information when available

### Data & Performance
- **Static Data** - All rare commodity data is static (locations never change - no updates needed)
- **Intelligent Caching** - System coordinates and market data cached locally
- **Manual Route Planning** - Users build routes manually from scan results
- **EDDN Integration** - Optional real-time market data via EDDN worker service

### Development Tools
- **Development Curation Tools** - Manual data curation interfaces (development mode only)
  - **Legality Curation** - Manual legality data curation interface (`/curate`)
  - **Price Curation** - Manual baseline price curation interface (`/curate-prices`)
- **Cache Status Display** - Shows when data was last updated
- **Comprehensive Logging** - Detailed console output for debugging

For detailed feature documentation, see the [API Documentation](./docs/api-documentation.md) and [Technical Design Document](./docs/technical-design.md).

## Tech Stack

- **Astro** - Main framework for server-side rendering and API routes
- **TypeScript** - Type-safe development throughout
- **React** - Interactive UI components (islands)
- **TailwindCSS** - Utility-first CSS framework for styling
- **EDSM API** - External data source for system information

See the [Technical Design Document](./docs/technical-design.md) for detailed architecture information.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js

**Optional (for EDDN Worker - Real-time Market Data):**
- **ZeroMQ** - Required for EDDN worker service
  - **Windows**: Download from [zeromq.org](https://zeromq.org/download/) or use `vcpkg install zeromq`
  - **macOS**: `brew install zeromq`
  - **Linux (Debian/Ubuntu)**: `sudo apt-get install libzmq3-dev`
  - **Linux (Fedora)**: `sudo dnf install zeromq-devel`

## Installation

1. **Clone or download the repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs all required packages including Astro, React, and ZeroMQ (if available).

3. **Optional: Create local config (kept out of the repo)**  
   To set your own paths or contact info (e.g. for EDSM API User-Agent), copy the sample and edit:
   ```bash
   cp config.sample.json .config.json
   ```
   Edit `.config.json` with your values. This file is gitignored and will not be shared.  
   - `edsmUserAgent` – string sent as User-Agent to EDSM (e.g. `"ED-Rare-Router/1.0 (contact: your@email.com)"`).  
   - `dataDir` – optional absolute path to the data directory; omit or set to `null` to use the default `data/` in the project root.  
   - `apiKeys` – object for all API keys (e.g. `"edsm": "your-key"`, `"eddn": "..."`). Env overrides: `EDSM_API_KEY`, `EDDN_API_KEY`, etc.

4. **Generate initial data files (optional but recommended):**
   ```bash
   # Export rare goods to JSON (for EDDN worker)
   npm run export:rares
   
   # Fetch initial market data from EDSM (optional)
   npm run fetch:market
   ```

## Running the Application

### Basic Usage (Web Server Only)

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

### With EDDN Worker (Real-time Market Data)

For real-time market data updates, run both services:

**Terminal 1 - Web Server:**
```bash
npm run dev
```

**Terminal 2 - EDDN Worker:**
```bash
npm run worker
```

The worker connects to EDDN via ZeroMQ and caches market data to `data/eddnMarketCache.json`.

### Production Build

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

For production deployment, see the [Local Deployment Guide](./docs/local-deployment.md) for process management (PM2, systemd) and running as a service.

## Deployment

### Local Deployment (Recommended)

This application is designed to run **locally on your own machine**. This enables all features including:
- EDDN worker service for real-time market data
- Persistent file storage
- Full control over the environment
- No serverless limitations

**Quick Start (Local):**
1. Install dependencies: `npm install`
2. Generate initial data: `npm run export:rares`
3. Start the application: `npm run dev`
4. Access at: `http://localhost:4321`

**Optional - Start EDDN Worker:**
- Install ZeroMQ (see [Local Deployment Guide](./docs/local-deployment.md))
- Run in separate terminal: `npm run worker`

For detailed local deployment instructions, see the [Local Deployment Guide](./docs/local-deployment.md).


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

## Configuration

Local settings are read from **`.config.json`** in the project root. This file is **not** committed to the repo.

- Copy **`config.sample.json`** to **`.config.json`** and edit as needed.
- **`edsmUserAgent`** – Used when calling the EDSM API (and in the market fetch script). Use a contact email or URL you are happy to share with EDSM; keep personal details only in your local `.config.json`.
- **`dataDir`** – Optional. Set to an absolute path to store cache and data files elsewhere (e.g. to avoid committing paths or to share a data directory). Leave `null` to use the default `data/` folder.
- **`apiKeys`** – Single place for all API keys. Use lowercase names, e.g. `"edsm": "your-key"`, `"eddn": "..."`. The app reads them via `getApiKey("edsm")`, etc. Environment variables override: set `EDSM_API_KEY`, `EDDN_API_KEY` (uppercase name + `_API_KEY`) for CI or deployment.

Without `.config.json`, the app uses defaults (generic User-Agent and `data/` under the project root).

## Project Structure

```
/
  README.md
  CHANGELOG.md
  config.sample.json   (copy to .config.json — not committed)
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

3. **Click "Scan Nearby Rares"**: The app will calculate distances and legality for all rare commodities (140-142, count still being verified).

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

## Author

**R.W. Harper - Easy Day Gamer**

- LinkedIn: [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)
- Email: easyday [at] rwharper [dot] com

## License

This project is licensed under the **GNU General Public License v3.0**.

**Important**: This license includes warranty disclaimers. The software is provided "AS IS" without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.

See the [LICENSE](./LICENSE) file for the full license text.

For more information about GPL v3.0, visit: [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
