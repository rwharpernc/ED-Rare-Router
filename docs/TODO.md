# TODO

**ED Rare Router**
Version: Beta 2
Last Updated: August 4, 2026

**Author:** R.W. Harper
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees are given, and the author and contributors aren't liable for damages arising from its use. See [LICENSE](../LICENSE) for full terms.

---

This file tracks planned improvements, features, and technical debt for ED Rare Router.

## High Priority

- [ ] **Better API integration with Frontier Developments** - look into the official API for game data, real-time market data if it's available, and official system/station info, BGS states, and market conditions.

- [ ] **Enhanced routing using Spansh or EDSM** - integrate Spansh for route planning and/or EDSM routing data for multi-hop routes, calculate optimal routes across multiple rare origins (nearest-neighbor or similar), and visualize routes with waypoints.

## Features

- [ ] **Destination system legality checker** - add a destination system field, query Inara or EDSM for its controlling faction and government type, and show which rares are legal or illegal there. Include faction name, government type, and superpower, and let users compare current vs. destination legality before traveling.

- [ ] Filtering/sorting for results - by legality status, PowerPlay eligibility, pad size, or sort by distance/cost.

- [ ] Export results - CSV/JSON export, clipboard copy, or shareable route plans.

- [ ] Better route planning - multi-stop planning via Spansh/EDSM, optimal visit order across multiple origins, travel time/distance estimates, and route export.

- [ ] Profit calculations - expected profit per rare, margins, and cross-rare profitability comparison.

- [ ] System/station info - security level, station services, faction info, economy types.

## Technical Improvements

- [ ] Better error handling - clearer API failure messages, retry logic for EDSM calls, graceful degradation when services are down.

- [ ] Performance - virtual scrolling for large result sets, fewer unnecessary React re-renders, request debouncing, maybe a service worker for offline use.

- [ ] Testing - unit tests for core logic, integration tests for API endpoints, E2E tests for critical flows, CI/CD test pipeline.

- [ ] Code quality - ESLint config, Prettier, stricter TypeScript, coverage reporting.

## Data & Content

- [ ] Expand the rare goods dataset - verify and fill in any missing items, add more metadata (prices, etc.). Data stays static since locations never change.

- [ ] More data sources - Inara API for additional data, station services, system security levels, faction influence.

- [ ] **Real-time stock/allocation data** - the EDDN worker approach was tried and removed (infrastructure cost - native ZeroMQ dependency, separate process - wasn't worth it for a hobby project). If this comes back, prefer simpler options first: check whether EDSM exposes market data for rare-goods stations, or lean further into cached EDSM calls / curated static prices.

## Documentation

- [ ] User guide/tutorial - step-by-step instructions, screenshots or a walkthrough video, common use cases.

- [ ] API usage examples - code samples, a Postman collection or similar, rate-limit notes.

## Infrastructure

- [ ] Monitoring and analytics - error tracking (e.g. Sentry), performance monitoring, privacy-respecting usage analytics.

- [ ] Deployment automation - automated cache generation in CI/CD, automated pre-deploy tests, a staging environment.

## Accessibility & UX

- [ ] Accessibility - ARIA labels/roles, keyboard navigation, screen reader support, color contrast.

- [ ] Mobile - better small-screen layouts, touch-friendly controls.

- [ ] Loading states - skeleton loaders, progress indicators, smoother transitions.

## Future Considerations

- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Persisted user preferences/settings
- [ ] Bookmark/favorite systems
- [ ] Shareable route links
- [ ] Community contributions for rare goods data

---

## DONE

### Completed Features

- [x] **Improved legal interpretation logic** (Completed: January 12, 2026) - added combined superpower + government restrictions, detailed explanations of which governments allow/disallow each item, a three-state display (Always Legal / Always Illegal / Conditional), and an expandable "Legality Details" section. Added a manual curation system for development mode, corrected numerous rares against Inara.cz, added support for complex restrictions (e.g. "Federal Democracy", "Alliance Theocracy"), and wrote up the legality-categories and data-accuracy-notes docs.

- [x] **Layout redesign** (Completed: January 12, 2026) - switched from side-by-side to vertical layout; the configuration panel sits above results at every screen size, with the responsive two-column grid removed.

- [x] **Documentation updates** (Completed: January 12, 2026) - added disclaimers across README, CHANGELOG, TODO, and all `docs/*.md` files, plus the legality-categories and data-accuracy-notes docs, and brought the rest of the documentation up to date with current design and features.

---

**Note:** This is a living document. Items get added, removed, or reprioritized as the project evolves.
