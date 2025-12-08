# TODO

**ED Rare Router**  
Last Updated: December 8, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

This file tracks planned improvements, features, and technical debt for ED Rare Router.

## High Priority

- [ ] **Enable API to handle more frequent refresh of data and eliminate the need for manual prefetching**
  - Automate rare systems cache updates
  - Consider background jobs or scheduled tasks
  - Reduce dependency on manual `npm run fetch-rare-systems` execution
  - May require build-time or runtime cache generation

## Features

- [ ] Add filtering/sorting options to results display
  - Filter by legality status
  - Filter by PowerPlay eligibility
  - Sort by distance, allocation, cost, etc.
  - Filter by pad size requirements

- [ ] Add export functionality for results
  - Export to CSV/JSON
  - Copy results to clipboard
  - Share route plans

- [ ] Add route optimization
  - Multi-stop route planning
  - Calculate optimal order for visiting multiple rare origins
  - Estimate total travel time/distance

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
  - Add more detailed metadata (prices, availability, etc.)
  - Add historical price data if available

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
