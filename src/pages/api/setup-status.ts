import type { APIRoute } from "astro";
import { configFileExists } from "../../lib/config";

export const prerender = false;

/**
 * GET /api/setup-status
 * Returns whether .config.json exists (for first-run setup flow).
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ hasConfig: configFileExists() }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
