# ED Rare Router Documentation

**Last updated:** March 1, 2026 · **Version:** 1.06.0-alpha

This directory holds setup guides, technical documentation, and deployment instructions for ED Rare Router.

## ⚠️ Important Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees are given regarding accuracy, reliability, or fitness for any purpose, and the author and contributors aren't liable for damages arising from its use.

See [LICENSE](../LICENSE) for the full GPL v3.0 terms.

## Documentation Index

### Core

1. **[Technical Design Document](./technical-design.md)** - architecture and design decisions, core modules and data models, performance and security notes
2. **[API Documentation](./api-documentation.md)** - endpoint specs, request/response formats, type definitions, error handling, rate limiting and caching
3. **[Data Appendix](./data-appendix.md)** - data structures and schemas for the rare goods dataset, PowerPlay powers, the rare-systems cache, and other runtime data
4. **[Architecture Overview](./architecture-overview.md)** - system diagrams, component architecture, data flow, the multi-layer caching setup, state management

### Deployment

5. **[Local Deployment Guide](./local-deployment.md)** - full setup, running the web server and EDDN worker together, process management (PM2, systemd), scheduled tasks, network access, troubleshooting
6. **[Deployment Guide](./deployment-guide.md)** - quick deployment reference
7. **[EDDN Worker Setup Guide](./eddn-worker-setup.md)** - ZeroMQ install, worker configuration, running as a service, troubleshooting
8. **[Setup Guide](./setup-guide.md)** - detailed first-run setup (web, CLI, manual), config reference and troubleshooting
9. **[Testing Market Data Fetch](./testing-market-data-fetch.md)** - testing the market data features

**Configuration:** local settings (paths, EDSM User-Agent, API keys) live in one gitignored file - copy `config.sample.json` to `.config.json` and edit. See the main [README](../README.md#configuration). Use `apiKeys` for API keys; env vars like `EDSM_API_KEY` override them for CI.

### Data & integration

10. **[EDDN Integration](./eddn-integration-research.md)** - EDDN overview, implementation, data structure
11. **[Bulk Market Data Fetch](./bulk-market-data-fetch.md)** - bulk fetch script, automation, cache structure
12. **[EDSM Market Data Limitations](./edsm-market-data-limitations.md)** - what the EDSM API can't tell you about market data
13. **[Data Accuracy Notes](./data-accuracy-notes.md)** - maintaining legality data accuracy
14. **[Legality Categories](./legality-categories.md)** - legality patterns by category
15. **[Troubleshooting Notes](./troubleshooting-notes.md)** - notes on design decisions and known issues

### Tools & curation

16. **[Rare Commodity Curation Guide](./tools/rare-commodity-curation-guide.md)** - adding/editing rares, the `generate:rare-coords` and `update:rare-inara-links` scripts
17. **[Rare Commodity Route Finder](./tools/rare-commodity-route-finder.md)** - route-ordering design notes

**User guide:** see [How to Use](../README.md#how-to-use) in the main README.

## Quick Links

- **Getting started:** [README.md](../README.md)
- **First-run setup:** [Setup Guide](./setup-guide.md)
- **Changelog:** [CHANGELOG.md](../CHANGELOG.md)
- **Project structure:** [Technical Design Document](./technical-design.md#21-project-structure)
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
- Setup questions: the [Local Deployment Guide](./local-deployment.md)
