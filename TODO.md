# TODO

**ED Rare Router**  
Version: unstable v1.3 (Unreleased)  
Last Updated: December 8, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

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

- [ ] **Improve legal interpretation logic**
  - Current logic only checks superpower and government restrictions
  - Some goods are legal in some systems but not others based on more complex rules
  - Need to research and implement more accurate legality evaluation
  - May require per-system or per-station legality data
  - Consider edge cases and exceptions to general rules

- [ ] Expand rare goods dataset
  - Verify and add any missing rare goods
  - Add more detailed metadata (prices, etc.)
  - All data is static - locations never change

- [ ] Add more data sources
  - Integrate with Inara API for additional data
  - Add station services data
  - Add system security levels
  - Add faction influence data

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

**Note**: This is a living document. Items may be added, removed, or reprioritized as the project evolves.
