# ED Rare Router Documentation

**Last updated:** August 4, 2026 · **Version:** Beta 2

This directory holds setup guides, technical documentation, and deployment instructions for ED Rare Router.

## ⚠️ Important Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees are given regarding accuracy, reliability, or fitness for any purpose, and the author and contributors aren't liable for damages arising from its use.

See [LICENSE](../LICENSE) for the full GPL v3.0 terms.

## Two ways to use this project

### Just want to run the app?

No install, no terminal, no code:

- **[Download & Run](../README.md#download--run-no-install)** in the main README - grab the packaged build and double-click it.
- **[Packaged Build Guide](./packaged-build-guide.md)** - what's in the download, where your settings/data live, changing the port, updating, uninstalling, and packaged-build-specific troubleshooting.
- **[How to Use](../README.md#how-to-use)** in the main README - using the app itself once it's running.

### Building from source or contributing?

1. **[Developer Guide](./development.md)** - building and running from source, npm scripts, project structure, dev-only interfaces
2. **[Setup Guide](./setup-guide.md)** - detailed first-run setup (web, CLI, manual), config reference and troubleshooting
3. **[Local Deployment Guide](./local-deployment.md)** - full setup, running the web server, process management (PM2, systemd), scheduled tasks, network access, troubleshooting
4. **[Testing Market Data Fetch](./testing-market-data-fetch.md)** - testing the market data features

**Configuration:** local settings (paths, EDSM User-Agent, API keys) live in one gitignored file - copy `config.sample.json` to `.config.json` and edit. See the [Setup Guide](./setup-guide.md#config-file-reference). Use `apiKeys` for API keys; env vars like `EDSM_API_KEY` override them for CI.

## Documentation Index

### Reference

1. **[Technical Design Document](./technical-design.md)** - purpose, tech stack, component responsibilities, core module reference, performance/security notes, and design rationale
2. **[API Documentation](./api-documentation.md)** - endpoint specs, request/response formats, type definitions, error handling, rate limiting and caching
3. **[Data Appendix](./data-appendix.md)** - data structures and schemas for the rare goods dataset, PowerPlay powers, the rare-systems cache, and other runtime data
4. **[Architecture Overview](./architecture-overview.md)** - system diagrams, data flow, the multi-layer caching setup, state management (canonical source for structure diagrams)

### Data & integration

5. **[Bulk Market Data Fetch](./bulk-market-data-fetch.md)** - bulk fetch script, automation, cache structure
6. **[EDSM Market Data Limitations](./edsm-market-data-limitations.md)** - what the EDSM API can't tell you about market data (canonical explanation)
7. **[Legality Categories](./legality-categories.md)** - legality patterns by category (canonical reference)
8. **[Data Accuracy Notes](./data-accuracy-notes.md)** - workflow for curating legality data from Inara
9. **[Troubleshooting Notes](./troubleshooting-notes.md)** - notes on design decisions and known issues

### Tools & curation

10. **[Rare Commodity Curation Guide](./tools/rare-commodity-curation-guide.md)** - adding/editing rares, the `generate:rare-coords` and `update:rare-inara-links` scripts
11. **[Rare Commodity Route Finder](./tools/rare-commodity-route-finder.md)** - route-ordering design notes for a possible future feature (not implemented)

### Project

12. **[TODO](./TODO.md)** - planned improvements, known gaps, and completed work

## Quick Links

- **Getting started:** [README.md](../README.md)
- **Packaged build:** [Packaged Build Guide](./packaged-build-guide.md)
- **Developer setup:** [Developer Guide](./development.md)
- **First-run setup:** [Setup Guide](./setup-guide.md)
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md)
- **Project structure:** [Developer Guide](./development.md#project-structure)
- **Local deployment:** [Local Deployment Guide](./local-deployment.md)

## Documentation Standards

- Markdown, for easy reading and version control
- Code examples with syntax highlighting
- Type definitions where they help clarity
- ASCII diagrams where a picture helps
- Version numbers and "last updated" dates on each doc

## Contributing to Documentation

When you update a doc:

1. Update its "Last Updated" date
2. Update version numbers if they've changed
3. Keep code examples in sync with the codebase
4. Add sections as the project grows
5. Try to match the style of the surrounding docs

## Questions?

- Project overview: the main [README.md](../README.md)
- Architecture questions: the [Technical Design Document](./technical-design.md)
- API questions: the [API Documentation](./api-documentation.md)
- Setup questions: the [Setup Guide](./setup-guide.md)
- Building from source: the [Developer Guide](./development.md)
