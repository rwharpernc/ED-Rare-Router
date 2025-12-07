import type { APIRoute } from "astro";
import { getSystem } from "../../lib/edsm";

/**
 * System lookup/verification endpoint.
 * 
 * Verifies if a system name exists in EDSM and returns system information.
 * Useful for validating manually entered system names.
 * 
 * Query parameter: ?name=<system-name>
 * Returns: System object with coordinates and info, or null if not found
 */
export const GET: APIRoute = async ({ url }) => {
  const name = url.searchParams.get("name");

  // Log for debugging
  console.log(`[system-lookup] Request for name: "${name}"`);

  if (!name || name.trim().length === 0) {
    console.warn(`[system-lookup] Empty or missing name parameter`);
    return new Response(
      JSON.stringify({ 
        error: "System name is required",
        found: false,
        system: null,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const system = await getSystem(name.trim());

    if (!system) {
      return new Response(
        JSON.stringify({ 
          found: false,
          system: null,
          message: `System "${name}" not found in EDSM database`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        found: true,
        system: {
          name: system.name,
          coords: system.coords,
          allegiance: system.allegiance,
          government: system.government,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in system-lookup API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to lookup system" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

