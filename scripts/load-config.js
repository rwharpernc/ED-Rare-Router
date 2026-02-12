/**
 * Load local config for Node scripts and workers.
 * Reads .config.json from project root (not committed). Copy config.sample.json to .config.json.
 * All API keys go in config.apiKeys; env override: EDSM_API_KEY, EDDN_API_KEY, etc.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_EDSM_USER_AGENT = 'ED-Rare-Router/1.0 (contact: https://github.com/your-org/ed-rare-router)';

function getProjectRoot() {
  // When run as node scripts/load-config.js or node workers/eddn-worker.js, cwd is usually project root
  return process.cwd();
}

let cached = null;

function loadRaw() {
  if (cached !== null) return cached;
  const configPath = join(getProjectRoot(), '.config.json');
  if (!existsSync(configPath)) {
    cached = {};
    return cached;
  }
  try {
    const content = readFileSync(configPath, 'utf-8');
    cached = JSON.parse(content);
    return cached;
  } catch (err) {
    console.warn('[config] Could not load .config.json:', err?.message || err);
    cached = {};
    return cached;
  }
}

export function getDataDir() {
  const config = loadRaw();
  if (config.dataDir && typeof config.dataDir === 'string') {
    return config.dataDir;
  }
  return join(getProjectRoot(), 'data');
}

export function getEdsmUserAgent() {
  const config = loadRaw();
  if (config.edsmUserAgent && typeof config.edsmUserAgent === 'string') {
    return config.edsmUserAgent;
  }
  if (process.env.EDSM_USER_AGENT) {
    return process.env.EDSM_USER_AGENT;
  }
  return DEFAULT_EDSM_USER_AGENT;
}

/**
 * Get API key by name. Prefers config.apiKeys[name], then process.env[NAME_API_KEY].
 * Returns undefined if not set.
 */
export function getApiKey(name) {
  const config = loadRaw();
  const key = String(name).toLowerCase();
  if (config.apiKeys && typeof config.apiKeys[key] === 'string' && config.apiKeys[key]) {
    return config.apiKeys[key];
  }
  const envName = `${key.replace(/-/g, '_').toUpperCase()}_API_KEY`;
  return process.env[envName];
}
