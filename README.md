# ED Rare Router

[![Release](https://img.shields.io/github/v/release/rwharpernc/ED-Rare-Router?label=release)](https://github.com/rwharpernc/ED-Rare-Router/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-informational)](#download--run-no-install)

A standalone web app for Elite Dangerous players planning rare goods trading routes, with PowerPlay integration.

**Beta 1** is out - functional and used regularly by the author, but still a solo hobby project. Expect occasional rough edges. Found a bug or have a feature request? [Open an issue](https://github.com/rwharpernc/ED-Rare-Router/issues) - feedback from beta testers is exactly what this release is for. See [CHANGELOG.md](./CHANGELOG.md) for what's new.

This is a personal hobby project, provided as-is with no warranty of any kind - see [License](#license) below for the full terms.

## Overview

ED Rare Router helps commanders:
- Scan for rare goods near their current location
- Find where rare goods originate and calculate distance from their current system
- Check legality of rare goods across different systems, with restriction details
- See which governments allow or disallow each item
- Build routes manually from scan results (the data is static, so nothing needs updating)

## Features

### Core
- **Quick Scan** - one button scans for all rare goods near your current system
- 142 rare commodities covering the major rare goods in Elite Dangerous
- System autocomplete backed by the EDSM API, with caching so repeat lookups are fast
- Lightyear distance calculations between systems
- Results sort closest-first, with unknown systems pushed to the end

### Legality
- Three-state legality display: Always Legal, Always Illegal, or Conditional
- Shows which governments and superpowers allow or disallow each item
- Handles combined restrictions, e.g. superpower + government pairs like "Federal Democracy"
- Click to expand full legality details for any item

### PowerPlay
- Fuzzy search for PowerPlay powers, with faction badges
- Finance Ethos is detected automatically from your selected power
- Effective CP divisors are shown with Finance Ethos applied

### Interface
- Vertical layout - selector panel above results at any screen size
- Optional pagination by distance, with nine page-size options (25-1000 ly)
- Each result shows pad size, cost, permit requirements, and legality
- "Back to top" button at the end of the results list
- Cost is shown as "(Est.)" from curated baseline prices or static costs, or "N/A" when unavailable

### Data & performance
- All rare commodity data is static - locations don't change, so there's nothing to keep in sync
- System coordinates and market data are cached locally
- Route planning stays manual - you build routes from scan results yourself

See the [API Documentation](./docs/api-documentation.md) and [Technical Design Document](./docs/technical-design.md) for the full feature writeup.

## Download & Run (no install)

Not a developer and don't want to install Node.js or use a terminal? There's a packaged build for that:

1. Grab the Windows (`-win-x64.zip`) or Linux (`-linux-x64.tar.gz`) build from the **[Releases page](https://github.com/rwharpernc/ED-Rare-Router/releases/latest)** and unzip it anywhere you can write files (Desktop or Documents - avoid `Program Files`).
2. Double-click `ED-Rare-Router.exe` (Windows) or run `./ED-Rare-Router` (Linux). A status window opens and your browser should launch automatically to the app.
3. First run only: you'll see a short setup form. Everything is optional, but filling in an EDSM "contact" string (your email or a URL) is recommended.
4. Close the status window to stop the app.

This build bundles its own Node.js runtime, so nothing needs to be installed.

Building this yourself, contributing, or want more control? See the **[Developer Guide](./docs/development.md)**.

## How to Use

### Basic usage

1. **Enter your current system** - the autocomplete helps you find the right name.

2. **Select your pledged power (optional)** - Finance Ethos is detected automatically from your power selection. If it applies, you'll see a green message showing the CP divisor reduction. Powers with Finance Ethos: Denton Patreus, Jerome Archer, Li Yong-Rui, Zemina Torval.

3. **Click "Scan Nearby Rares"** - the app calculates distance and legality for all 142 rare commodities.

### Reading results

Results sort by distance, closest first. Each entry shows:
- Distance from your current system to the rare's origin
- Legality at your current system:
  - **Green "Legal"** = legal everywhere
  - **Red "Illegal"** = illegal everywhere
  - **Yellow "Conditional"** = legal in some systems, illegal in others (click to see which)
- Pad size, cost, permit requirements, and other details

A "Back to top" button appears at the end of the list.

### Pagination

All results show by default. Turn on "Paginate by Distance" to break results into distance ranges - pick from nine page sizes: 25, 50, 75, 100, 150, 200, 250, 500, or 1000 light years. Useful when a scan returns a lot of results and you want to focus on a specific range.

### Finance Ethos

Finance Ethos is detected automatically from your selected power - there's no checkbox to toggle. Pick a power that has it, and a green confirmation message appears. Powers with Finance Ethos:
- Denton Patreus (Empire)
- Jerome Archer (Federation)
- Li Yong-Rui (Independent)
- Zemina Torval (Empire)

## Feedback & Known Limitations

This is a beta - a few things worth knowing:
- A couple of dataset entries are still being cross-checked against community references (external sources cite ~140 rare commodities, this dataset ships 142). See [Data Accuracy Notes](./docs/data-accuracy-notes.md).
- Route planning is manual by design - the app calculates distance and legality, you build the route yourself from scan results.
- Bugs, rough edges, and missing features are expected. [Open an issue](https://github.com/rwharpernc/ED-Rare-Router/issues) if you hit one, or check [TODO.md](./docs/TODO.md) for what's already planned.

## Documentation

- **[Developer Guide](./docs/development.md)** — building and running from source, npm scripts, project structure
- **[Documentation Index](./docs/README.md)** — every doc in this repo
- **[CHANGELOG.md](./CHANGELOG.md)** — version history and changes

Only `README.md` and `CHANGELOG.md` live at the repo root - everything else is under `/docs`.

## Author

**R.W. Harper**

- LinkedIn: [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)

## License

Licensed under the GNU General Public License v3.0.

This is a personal hobby project, not a commercial product, provided "AS IS" without warranty of any kind, express or implied - including the implied warranties of merchantability, fitness for a particular purpose, and noninfringement. No guarantees are made about accuracy, reliability, or fitness for any purpose; you assume all risk associated with using it, and the author and contributors aren't liable for damages arising from its use.

See [LICENSE](./LICENSE) for the full text, or visit [gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html) for more on GPL v3.0.
