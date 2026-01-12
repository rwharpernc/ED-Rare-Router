# Deployment Guide

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given regarding deployment, availability, or fitness for any purpose. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../../LICENSE) file for full terms.

**ED Rare Router**  
Version: unstable v1.3 (Unreleased)  
Last Updated: December 8, 2025

**Author:** R.W. Harper - Easy Day Gamer  
**LinkedIn:** [https://linkedin.com/in/rwhwrites](https://linkedin.com/in/rwhwrites)  
**Email:** easyday [at] rwharper [dot] com  
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

Netlify provides excellent support for Astro serverless functions and is the recommended deployment platform. This is the primary deployment target and is regularly tested.

#### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Pre-fetch rare systems data** (recommended for faster performance):
   ```bash
   ```
   This creates `data/rareSystemsCache.json` with all rare origin system coordinates. The cache file should be committed to your repository.
   
   **Important Notes**:
   - The application will work without this cache (it falls back to API lookups), but performance will be slower
   - If you see an error about `tsx` not being found, ensure you've run `npm install` first
   - Commit the generated `data/rareSystemsCache.json` file to your repository
   
   **When to run this script**:
   - **Before first deployment** (recommended for production)
   - After adding new rare goods to the dataset
   - After correcting system names in the rare goods data
   - Periodically to refresh system data (optional)

3. **Configure for Netlify**:
   - The `netlify.toml` file is already configured with the correct build command
   - The build command automatically copies `astro.config.netlify.mjs` to `astro.config.mjs` before building
   - **Important**: Do NOT add `@astrojs/netlify` as a plugin in `netlify.toml` - it is an Astro adapter, not a Netlify build plugin
   - The `netlify.toml` build command handles the adapter configuration automatically

4. **Deploy via Netlify Dashboard**:
   - Connect your Git repository to Netlify
   - Netlify will auto-detect the build settings from `netlify.toml`
   - The build command in `netlify.toml` will:
     1. Copy `astro.config.netlify.mjs` to `astro.config.mjs`
     2. Run `npm run build`
   - Publish directory: `dist`
   - Deploy!

5. **Deploy via Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

#### Troubleshooting Netlify Builds

If you encounter the error: `"The plugin '@astrojs/netlify' is missing a manifest.yml"`:
- **Cause**: `@astrojs/netlify` was incorrectly added as a Netlify build plugin in `netlify.toml`
- **Solution**: Remove any `[[plugins]]` section from `netlify.toml` that references `@astrojs/netlify`
- The adapter is configured in `astro.config.netlify.mjs`, not as a Netlify plugin

#### Environment Variables

Set these in Netlify dashboard under Site settings > Environment variables:
- `EDSM_USER_AGENT` (optional) - Custom User-Agent for EDSM API requests

#### Serverless Functions

Netlify automatically converts Astro API routes to serverless functions. All endpoints in `src/pages/api/` will be available as:
- `/api/systems`
- `/api/rares-scan`
- `/api/system-lookup`

### Vercel

> **Note**: Vercel deployment is not regularly tested or verified. If you encounter issues or need updates to these instructions, please report them.

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

3. **Pre-fetch rare systems data** (recommended):
   ```bash
   ```
   Commit `data/rareSystemsCache.json` to your repository.
   
   **Note**: The application will work without this cache (it falls back to API lookups), but performance will be slower.

4. **Deploy**:
   - Connect repository to Vercel
   - Vercel will auto-detect Astro and configure appropriately

### Cloudflare Pages

> **Note**: Cloudflare Pages deployment is not regularly tested or verified. If you encounter issues or need updates to these instructions, please report them.

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

3. **Pre-fetch rare systems data** (recommended):
   ```bash
   ```
   Commit `data/rareSystemsCache.json` to your repository.
   
   **Note**: The application will work without this cache (it falls back to API lookups), but performance will be slower.

4. **Deploy**:
   - Connect repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Node.js (Self-hosted)

> **Note**: Self-hosted Node.js deployment is primarily used for local development. Production self-hosting is not regularly tested or verified. If you encounter issues or need updates to these instructions, please report them.

The application is already configured with the Node.js adapter for local development.

1. **Pre-fetch rare systems data** (recommended):
   ```bash
   ```
   
   **Note**: The application will work without this cache (it falls back to API lookups), but performance will be slower.

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   node dist/server/entry.mjs
   ```

4. **Configure your web server** (nginx, Apache, etc.) to proxy to the Node.js server.

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
4. ✅ Scan mode returns results correctly
5. ✅ API endpoints respond correctly

## Support

For platform-specific issues, consult:
- [Astro Deployment Docs](https://docs.astro.build/en/guides/deploy/)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

