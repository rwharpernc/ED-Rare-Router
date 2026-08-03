/**
 * Local configuration loader for ED Rare Router.
 *
 * Reads from `.config.json` in the project root (gitignored). Use `config.sample.json`
 * as a template. All API keys and secrets belong under `apiKeys`; environment variables
 * override via EDSM_API_KEY, etc. (uppercase name + _API_KEY).
 *
 * @module config
 * @see docs/setup-guide.md for first-run setup
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export interface AppConfig {
  /** User-Agent / contact for EDSM API requests. Avoid putting personal email in repo. */
  edsmUserAgent?: string;
  /** Optional absolute path to data directory. If not set, uses <project>/data. */
  dataDir?: string | null;
  /**
   * All API keys in one place. Keys are lowercase names (e.g. "edsm").
   * Env override: EDSM_API_KEY (uppercase name + _API_KEY).
   */
  apiKeys?: Record<string, string>;
}

const DEFAULT_EDSM_USER_AGENT =
  "ED-Rare-Router/1.0 (contact: https://github.com/your-org/ed-rare-router)";

let cachedConfig: AppConfig | null = null;

const CONFIG_PATH = join(process.cwd(), ".config.json");

/**
 * Returns whether `.config.json` exists in the project root.
 * Used by middleware to redirect to /setup on first run.
 * @returns true if the file exists, false otherwise
 */
export function configFileExists(): boolean {
  return existsSync(CONFIG_PATH);
}

/**
 * Writes `.config.json` to the project root. Used only by the setup API.
 * Clears the in-memory cache so the next read uses the new file.
 * @param config - Valid AppConfig (edsmUserAgent, dataDir, apiKeys)
 */
export function writeConfig(config: AppConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  cachedConfig = null;
}

function loadConfigRaw(): AppConfig {
  if (cachedConfig !== null) return cachedConfig;
  if (!existsSync(CONFIG_PATH)) {
    cachedConfig = {};
    return cachedConfig;
  }
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    cachedConfig = JSON.parse(content) as AppConfig;
    return cachedConfig!;
  } catch (error) {
    console.warn("[config] Could not load .config.json:", error);
    cachedConfig = {};
    return cachedConfig;
  }
}

/**
 * Returns the data directory path for caches and generated files.
 * Uses config.dataDir if set; otherwise returns <cwd>/data.
 * @returns Absolute path to the data directory
 */
export function getDataDir(): string {
  const config = loadConfigRaw();
  if (config.dataDir && typeof config.dataDir === "string") {
    return config.dataDir;
  }
  return join(process.cwd(), "data");
}

/**
 * Returns the User-Agent string sent to the EDSM API.
 * Precedence: config.edsmUserAgent → EDSM_USER_AGENT env → default.
 * @returns Non-empty string suitable for User-Agent header
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
 * Returns an API key by name (e.g. "edsm").
 * Precedence: config.apiKeys[name] (lowercase) → process.env[NAME_API_KEY] (e.g. EDSM_API_KEY).
 * @param name - Key name (case-insensitive); env var is uppercase + _API_KEY
 * @returns The key string, or undefined if not set
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
