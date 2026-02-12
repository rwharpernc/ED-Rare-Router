import type { APIRoute } from "astro";
import { configFileExists, writeConfig } from "../../lib/config";
import type { AppConfig } from "../../lib/config";

export const prerender = false;

/**
 * POST /api/setup
 * Body: { edsmUserAgent?: string, dataDir?: string | null, apiKeys?: Record<string, string> }
 * Creates .config.json. Only allowed when config does not exist (first-run), unless body.overwrite is true.
 */
export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type")?.includes("application/json") === false) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be application/json" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const hasExisting = configFileExists();
  const overwrite = body.overwrite === true;
  if (hasExisting && !overwrite) {
    return new Response(
      JSON.stringify({
        error: "Config already exists. Edit .config.json manually or pass overwrite: true to replace.",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const config: AppConfig = {
    edsmUserAgent:
      typeof body.edsmUserAgent === "string" && body.edsmUserAgent.trim() !== ""
        ? body.edsmUserAgent.trim()
        : undefined,
    dataDir:
      body.dataDir === null || body.dataDir === ""
        ? null
        : typeof body.dataDir === "string" && body.dataDir.trim() !== ""
          ? body.dataDir.trim()
          : undefined,
    apiKeys:
      body.apiKeys && typeof body.apiKeys === "object" && !Array.isArray(body.apiKeys)
        ? (Object.fromEntries(
            Object.entries(body.apiKeys).filter(
              (e): e is [string, string] =>
                typeof e[0] === "string" && typeof e[1] === "string"
            )
          ) as Record<string, string>)
        : undefined,
  };

  if (config.edsmUserAgent === undefined) delete (config as Record<string, unknown>).edsmUserAgent;
  if (config.apiKeys === undefined || Object.keys(config.apiKeys).length === 0) {
    delete (config as Record<string, unknown>).apiKeys;
  }

  try {
    writeConfig(config);
    return new Response(
      JSON.stringify({ ok: true, message: "Config saved." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[setup] Failed to write .config.json:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to write config file.",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
