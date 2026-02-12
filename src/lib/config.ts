/**
 * Local configuration loader.
 * Reads from .config.json in the project root (not committed to the repo).
 * Use config.sample.json as a template and copy to .config.json.
 *
 * All API keys and secrets belong in .config.json under "apiKeys".
 * Env vars override: EDSM_API_KEY, EDDN_API_KEY, etc. (uppercase key + _API_KEY).
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface AppConfig {
  /** User-Agent / contact for EDSM API requests. Avoid putting personal email in repo. */
  edsmUserAgent?: string;
  /** Optional absolute path to data directory. If not set, uses <project>/data. */
  dataDir?: string | null;
  /**
   * All API keys in one place. Keys are lowercase names (e.g. "edsm", "eddn").
   * Env override: EDSM_API_KEY, EDDN_API_KEY (uppercase name + _API_KEY).
   */
  apiKeys?: Record<string, string>;
}

const DEFAULT_EDSM_USER_AGENT =
  "ED-Rare-Router/1.0 (contact: https://github.com/your-org/ed-rare-router)";

let cachedConfig: AppConfig | null = null;

function loadConfigRaw(): AppConfig {
  if (cachedConfig !== null) return cachedConfig;
  const configPath = join(process.cwd(), ".config.json");
  if (!existsSync(configPath)) {
    cachedConfig = {};
    return cachedConfig;
  }
  try {
    const content = readFileSync(configPath, "utf-8");
    cachedConfig = JSON.parse(content) as AppConfig;
    return cachedConfig!;
  } catch (error) {
    console.warn("[config] Could not load .config.json:", error);
    cachedConfig = {};
    return cachedConfig;
  }
}

/**
 * Returns the data directory path. Uses config.dataDir if set, otherwise &lt;cwd&gt;/data.
 */
export function getDataDir(): string {
  const config = loadConfigRaw();
  if (config.dataDir && typeof config.dataDir === "string") {
    return config.dataDir;
  }
  return join(process.cwd(), "data");
}

/**
 * Returns the EDSM User-Agent string. Prefers config, then env EDSM_USER_AGENT, then default.
 */
export function getEdsmUserAgent(): string {
  const config = loadConfigRaw();
  if (config.edsmUserAgent && typeof config.edsmUserAgent === "string") {
    return config.edsmUserAgent;
  }
  if (process.env.EDSM_USER_AGENT) {
    return process.env.EDSM_USER_AGENT;
  }
  return DEFAULT_EDSM_USER_AGENT;
}

/**
 * Returns an API key by name. Prefers config.apiKeys[name], then process.env[NAME_API_KEY].
 * Name is case-insensitive for config; env var is uppercase with _API_KEY suffix (e.g. edsm -> EDSM_API_KEY).
 * Returns undefined if not set.
 */
export function getApiKey(name: string): string | undefined {
  const config = loadConfigRaw();
  const key = name.toLowerCase();
  if (config.apiKeys && typeof config.apiKeys[key] === "string" && config.apiKeys[key]) {
    return config.apiKeys[key];
  }
  const envName = `${key.replace(/-/g, "_").toUpperCase()}_API_KEY`;
  return process.env[envName];
}
