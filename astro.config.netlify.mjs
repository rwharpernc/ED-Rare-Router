// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// Netlify configuration for production deployment
// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable server-side rendering for API routes
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});

