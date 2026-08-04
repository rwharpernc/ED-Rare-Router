/**
 * Astro middleware: runs before every request.
 *
 * Handles redirects in middleware (before any response is streamed) to avoid
 * ResponseSentError when a page or layout would return a redirect after content started.
 *
 * - First-run: if .config.json does not exist, redirect to /setup (except /setup and /api).
 * - Dev-only pages: /curate and /curate-prices redirect to / in production.
 */
import { defineMiddleware } from "astro:middleware";
import { configFileExists } from "./lib/config";

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;

  if (!configFileExists() && pathname !== "/setup" && !pathname.startsWith("/api")) {
    return new Response(null, { status: 302, headers: { Location: "/setup" } });
  }

  if (!import.meta.env.DEV && (pathname === "/curate-prices" || pathname === "/curate")) {
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }

  return next();
});
