import type { APIRoute } from "astro";
import { searchSystems } from "../../lib/edsm";

/**
 * System autocomplete endpoint.
 * 
 * Provides system name suggestions for autocomplete functionality.
 * Uses EDSM API to search for systems matching the query.
 * 
 * Query parameter: ?q=<partial-name>
 * Returns: Array of system objects with name and coordinates
 */
export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q");

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const systems = await searchSystems(query);

    // Return simplified format for autocomplete
    const autocompleteResults = systems.map((system) => ({
      name: system.name,
      coords: system.coords,
    }));

    return new Response(JSON.stringify(autocompleteResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // 5 minutes cache
      },
    });
  } catch (error) {
    console.error("Error in systems API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch systems" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
