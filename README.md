# ED Rare Router

A standalone web application for Elite Dangerous players to plan rare goods trading routes with PowerPlay integration.

## ⚠️ Developer Notes

**This is early development work.** The application is not fully functional and is **not ready for open testing**. Features may be incomplete, unstable, or subject to significant changes. Use at your own risk.

## Overview

ED Rare Router helps commanders:
- Find rare goods origins and calculate distances from their current location
- Plan routes between systems for optimal rare goods trading
- Evaluate legality of rare goods in different systems
- Calculate PowerPlay control points (CP) for profit-based trading in acquisition and exploit systems

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

For detailed deployment instructions, see the [Deployment Guide](./docs/deployment-guide.md).

**Quick Start (Netlify):**
1. Copy `astro.config.netlify.mjs` to `astro.config.mjs` before building
2. Connect your repository to Netlify
3. Netlify will auto-detect settings from `netlify.toml`

**Note:** For local development, keep using `@astrojs/node` adapter. Switch to Netlify adapter only for deployment.

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
        rares-analyze.ts
    components/
      Layout.astro
      RaresPlannerIsland.tsx
      SystemInput.tsx
      ResultsList.tsx
    data/
      rares.ts
    lib/
      edsm.ts
      distances.ts
      legality.ts
      powerplay.ts
    types/
      rares.ts
      edsm.ts
      api.ts
  styles/
    global.css
```

## Features

- **System Autocomplete** - Search for systems using EDSM API with intelligent caching
- **Distance Calculations** - Compute lightyear distances between systems
- **Legality Evaluation** - Check if rare goods are legal in specific systems
- **PowerPlay 2.0 Integration** - Calculate CP divisors for profit-based trading
- **Power Autocomplete** - Fuzzy search for PowerPlay powers with faction badges
- **Two Analysis Modes**:
  - **Scan** - Quick analysis from current system
  - **Analyze** - Full route planning between current and target systems

For detailed feature documentation, see the [API Documentation](./docs/api-documentation.md) and [Technical Design Document](./docs/technical-design.md).

## Author

**R.W. Harper - Easy Day Gamer**

- LinkedIn: [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)

## License

This project is licensed under the **GNU General Public License v3.0**.

See the [LICENSE](./LICENSE) file for the full license text.

For more information about GPL v3.0, visit: [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html)
