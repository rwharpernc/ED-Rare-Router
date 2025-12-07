# Deployment Guide

**ED Rare Router**  
Last Updated: December 7, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**License:** GNU General Public License v3.0

## Overview

ED Rare Router uses Astro's server mode to enable API endpoints. This requires a server adapter for deployment. The application is configured to work with multiple deployment platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository connected to your deployment platform
- Account on your chosen deployment platform

## Deployment Options

### Netlify (Recommended)

Netlify provides excellent support for Astro serverless functions and is the recommended deployment platform.

#### Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Configure for Netlify**:
   - The `netlify.toml` file is already configured
   - For deployment, use `astro.config.netlify.mjs` as your config:
     ```bash
     cp astro.config.netlify.mjs astro.config.mjs
     ```
   - Or manually update `astro.config.mjs` to use the Netlify adapter

3. **Deploy via Netlify Dashboard**:
   - Connect your Git repository to Netlify
   - Netlify will auto-detect the build settings from `netlify.toml`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy!

4. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

#### Environment Variables

Set these in Netlify dashboard under Site settings > Environment variables:
- `EDSM_USER_AGENT` (optional) - Custom User-Agent for EDSM API requests

#### Serverless Functions

Netlify automatically converts Astro API routes to serverless functions. All endpoints in `src/pages/api/` will be available as:
- `/api/systems`
- `/api/rares-scan`
- `/api/rares-analyze`
- `/api/system-lookup`

### Vercel

1. **Install Vercel adapter**:
   ```bash
   npm install @astrojs/vercel
   ```

2. **Update `astro.config.mjs`**:
   ```javascript
   import vercel from '@astrojs/vercel';
   
   export default defineConfig({
     output: 'server',
     adapter: vercel(),
     // ... rest of config
   });
   ```

3. **Deploy**:
   - Connect repository to Vercel
   - Vercel will auto-detect Astro and configure appropriately

### Cloudflare Pages

1. **Install Cloudflare adapter**:
   ```bash
   npm install @astrojs/cloudflare
   ```

2. **Update `astro.config.mjs`**:
   ```javascript
   import cloudflare from '@astrojs/cloudflare';
   
   export default defineConfig({
     output: 'server',
     adapter: cloudflare(),
     // ... rest of config
   });
   ```

3. **Deploy**:
   - Connect repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Node.js (Self-hosted)

The application is already configured with the Node.js adapter for local development.

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the server**:
   ```bash
   node dist/server/entry.mjs
   ```

3. **Configure your web server** (nginx, Apache, etc.) to proxy to the Node.js server.

## Build Configuration

### Local Development

For local development, use the default `astro.config.mjs` with the Node adapter:
```javascript
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // ...
});
```

### Production Deployment

Switch to your platform's adapter before building:
- Netlify: Use `astro.config.netlify.mjs`
- Vercel: Update config to use `@astrojs/vercel`
- Cloudflare: Update config to use `@astrojs/cloudflare`

## Troubleshooting

### Build Errors

- **"No adapter installed"**: Make sure you've installed and configured the appropriate adapter for your deployment platform
- **"POST requests not available"**: Ensure `output: 'server'` is set and API routes have `export const prerender = false;`

### Runtime Errors

- **API endpoints return 404**: Verify the adapter is correctly configured and the build completed successfully
- **CORS errors**: Check that your API routes are properly configured for server-side rendering

### Environment Variables

If you need to set environment variables:
- **Netlify**: Site settings > Environment variables
- **Vercel**: Project settings > Environment variables
- **Cloudflare Pages**: Settings > Environment variables

## Post-Deployment

After deployment, verify:
1. ✅ Main page loads correctly
2. ✅ System autocomplete works
3. ✅ Scan mode returns results
4. ✅ Analyze mode works with target system
5. ✅ API endpoints respond correctly

## Support

For platform-specific issues, consult:
- [Astro Deployment Docs](https://docs.astro.build/en/guides/deploy/)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

