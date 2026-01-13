# TODO

**ED Rare Router**  
Version: unstable v1.4 (Unreleased)  
Last Updated: January 12, 2026

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](./LICENSE) file for full terms.

---

This file tracks planned improvements, features, and technical debt for ED Rare Router.

## High Priority

- [ ] **Better API integration with Frontier Developments**
  - Explore Frontier Developments API for official game data
  - Integrate real-time market data if available
  - Get official system/station information
  - Access current BGS states and market conditions

- [ ] **Enhanced routing system using Spansh or EDSM**
  - Integrate with Spansh API for route planning
  - Use EDSM routing data for multi-hop routes
  - Calculate optimal routes between multiple rare origins
  - Support route optimization algorithms (nearest neighbor, etc.)
  - Display route visualization with waypoints

## Features

- [ ] **Destination system legality checker**
  - Add input field for destination system name
  - Query Inara or EDSM API to get controlling faction and government type for destination
  - Check legality status for all rare goods at the destination system
  - Display results showing which rares are legal/illegal at destination
  - Show controlling faction name, government type, and superpower
  - Allow comparison between current system and destination system legality
  - Useful for route planning to verify legality before traveling

- [ ] Add filtering/sorting options to results display
  - Filter by legality status
  - Filter by PowerPlay eligibility
  - Sort by distance, cost, etc.
  - Filter by pad size requirements

- [ ] Add export functionality for results
  - Export to CSV/JSON
  - Copy results to clipboard
  - Share route plans

- [ ] Enhanced route planning features
  - Multi-stop route planning with Spansh/EDSM integration
  - Calculate optimal order for visiting multiple rare origins
  - Estimate total travel time/distance
  - Route visualization and export

- [ ] Add profit calculations
  - Calculate expected profit per rare
  - Show profit margins
  - Compare profitability across rares

- [ ] Add system/station information display
  - Show system security level
  - Display station services
  - Show faction information
  - Display system economy types

## Technical Improvements

- [ ] Improve error handling and user feedback
  - Better error messages for API failures
  - Retry logic for failed EDSM API calls
  - Graceful degradation when services are unavailable

- [ ] Performance optimizations
  - Implement virtual scrolling for large result sets
  - Optimize React re-renders
  - Add request debouncing where appropriate
  - Consider service worker for offline capability

- [ ] Testing
  - Add unit tests for core logic
  - Add integration tests for API endpoints
  - Add E2E tests for critical user flows
  - Set up CI/CD testing pipeline

- [ ] Code quality
  - Add ESLint configuration
  - Add Prettier for code formatting
  - Improve TypeScript strictness
  - Add code coverage reporting

## Data & Content

- [ ] Expand rare goods dataset
  - Verify and add any missing rare goods
  - Add more detailed metadata (prices, etc.)
  - All data is static - locations never change

- [ ] Add more data sources
  - Integrate with Inara API for additional data
  - Add station services data
  - Add system security levels
  - Add faction influence data
- [ ] **Real-time stock/allocation data integration**
  - Research EDDN integration for real-time market data (see `docs/eddn-integration-research.md`)
  - Test EDSM API for market data availability on rare goods stations
  - Evaluate infrastructure requirements (worker service, database)
  - Consider simpler alternatives (static allocation data, EDSM API with caching)
  - Implement chosen approach based on research findings

## Documentation

- [ ] Add user guide/tutorial
  - Step-by-step usage instructions
  - Screenshots or video walkthrough
  - Common use cases and examples

- [ ] Add API usage examples
  - Code examples for integrating with the API
  - Postman collection or similar
  - Rate limiting documentation

## Infrastructure

- [ ] Set up monitoring and analytics
  - Error tracking (e.g., Sentry)
  - Performance monitoring
  - Usage analytics (privacy-respecting)

- [ ] Improve deployment automation
  - Automated cache generation in CI/CD
  - Automated testing before deployment
  - Staging environment setup

## Accessibility & UX

- [ ] Improve accessibility
  - ARIA labels and roles
  - Keyboard navigation
  - Screen reader support
  - Color contrast improvements

- [ ] Mobile responsiveness improvements
  - Optimize for smaller screens
  - Touch-friendly controls
  - Mobile-specific layouts

- [ ] Add loading states and animations
  - Skeleton loaders
  - Progress indicators
  - Smooth transitions

## Future Considerations

- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] User preferences/settings persistence
- [ ] Bookmark/favorite systems
- [ ] Shareable route links
- [ ] Community contributions for rare goods data

---

## DONE

### Completed Features

- [x] **Improve legal interpretation logic** (Completed: January 12, 2026)
  - Enhanced legality system with support for combined superpower + government restrictions
  - Implemented detailed legality explanations showing which governments allow/disallow each item
  - Added three-state legality display: Always Legal, Always Illegal, or Conditional
  - Created expandable "Legality Details" section for each rare good
  - Shows illegal superpowers, illegal governments, and combined restrictions separately
  - Added manual curation system for development mode to maintain data accuracy
  - Updated multiple rare goods with correct legality data based on Inara.cz
  - Added support for complex restrictions (e.g., "Federal Democracy", "Alliance Theocracy")
  - Created documentation for legality categories and data accuracy maintenance

- [x] **Layout redesign** (Completed: January 12, 2026)
  - Changed from side-by-side to vertical layout
  - Selector panel (Configuration) now appears above results on all screen sizes
  - Removed responsive two-column layout (grid)
  - Consistent vertical stacking regardless of viewport size

- [x] **Documentation updates** (Completed: January 12, 2026)
  - Added comprehensive disclaimers throughout all documentation files
  - Updated README, CHANGELOG, TODO, and all docs/*.md files with project disclaimers
  - Added legality categories documentation
  - Added data accuracy notes documentation
  - Updated all documentation to reflect current design and features

---

**Note**: This is a living document. Items may be added, removed, or reprioritized as the project evolves.
