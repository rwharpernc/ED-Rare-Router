# ED Rare Router Documentation

Welcome to the ED Rare Router documentation. This directory contains comprehensive technical documentation for the project.

## ⚠️ Important Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding accuracy, reliability, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software.

See the [LICENSE](../LICENSE) file for full terms under the GNU General Public License v3.0.

## Available Documentation

### Core Documentation

- **[Technical Design Document](./technical-design.md)** - Comprehensive technical architecture and design decisions
- **[API Documentation](./api-documentation.md)** - Complete API endpoint specifications
- **[Data Appendix](./data-appendix.md)** - Data structures and static datasets
- **[Architecture Overview](./architecture-overview.md)** - System architecture and data flow

### Deployment & Setup

- **[Local Deployment Guide](./local-deployment.md)** - Complete guide for running the application locally
- **[Deployment Guide](./deployment-guide.md)** - Quick deployment reference
- **[EDDN Worker Setup Guide](./eddn-worker-setup.md)** - Setting up the EDDN worker service for real-time market data
- **[Testing Market Data Fetch](./testing-market-data-fetch.md)** - Testing instructions for market data features

### Data & Integration

- **[EDDN Integration](./eddn-integration-research.md)** - EDDN integration overview and implementation
- **[Bulk Market Data Fetch](./bulk-market-data-fetch.md)** - Guide for bulk fetching and caching EDSM market data
- **[EDSM Market Data Limitations](./edsm-market-data-limitations.md)** - Important limitations of EDSM API for market data
- **[Data Accuracy Notes](./data-accuracy-notes.md)** - Guide for maintaining legality data accuracy
- **[Legality Categories](./legality-categories.md)** - Reference guide for legality patterns by category
- **[Troubleshooting Notes](./troubleshooting-notes.md)** - Troubleshooting notes and explanations for design decisions

**User Guide**: See the [How to Use](../README.md#how-to-use) section in the main README for usage instructions.

## Documentation Index

### Core Documentation

1. **[Technical Design Document](./technical-design.md)**
   - Complete technical overview
   - Architecture and design decisions
   - Core modules and data models
   - Performance considerations
   - Security information

2. **[API Documentation](./api-documentation.md)**
   - Complete API endpoint specifications
   - Request/response formats
   - Type definitions
   - Error handling
   - Rate limiting and caching

3. **[Data Appendix](./data-appendix.md)**
   - Data structures and schemas
   - Rare goods dataset documentation
   - PowerPlay powers dataset
   - Rare systems cache (pre-fetched)
   - Runtime data (cache files)
   - Data sources and maintenance

4. **[Architecture Overview](./architecture-overview.md)**
   - System architecture diagrams
   - Component architecture
   - Data flow diagrams
   - Multi-layer caching architecture
   - State management
   - Performance optimizations

### Deployment Documentation

5. **[Local Deployment Guide](./local-deployment.md)**
   - Complete setup instructions
   - Running web server and EDDN worker
   - Process management (PM2, systemd)
   - Scheduled tasks
   - Network access configuration
   - Troubleshooting

6. **[EDDN Worker Setup Guide](./eddn-worker-setup.md)**
   - ZeroMQ installation
   - Worker service configuration
   - Running as a service
   - Troubleshooting

### Data Integration

7. **[EDDN Integration](./eddn-integration-research.md)**
   - EDDN overview
   - Implementation details
   - Data structure
   - Implementation details

8. **[Bulk Market Data Fetch](./bulk-market-data-fetch.md)**
   - Bulk fetch script usage
   - Automation options
   - Cache file structure
   - API integration

## Quick Links

- **Getting Started**: See the main [README.md](../README.md)
- **Changelog**: See [CHANGELOG.md](../CHANGELOG.md)
- **Project Structure**: See [Technical Design Document](./technical-design.md#21-project-structure)
- **Local Deployment**: See [Local Deployment Guide](./local-deployment.md)

## Documentation Standards

All documentation in this directory follows these principles:

- **Markdown format** for easy reading and version control
- **Code examples** with syntax highlighting
- **Type definitions** for clarity
- **Diagrams** using ASCII art where appropriate
- **Version numbers** and last updated dates

## Contributing to Documentation

When updating documentation:

1. Update the "Last Updated" date at the top of the document
2. Update version numbers if applicable
3. Keep code examples current with the codebase
4. Add new sections as the project evolves
5. Maintain consistency with existing documentation style

## Questions?

If you have questions about the documentation or find errors, please:
- Check the main [README.md](../README.md) for project overview
- Review the [Technical Design Document](./technical-design.md) for architecture questions
- Consult the [API Documentation](./api-documentation.md) for API-related questions
- See the [Local Deployment Guide](./local-deployment.md) for setup questions
