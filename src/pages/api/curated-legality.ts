import type { APIRoute } from "astro";
import {
  loadCuratedLegality,
  saveCuratedLegality,
  type CuratedLegalityData,
} from "../../lib/curatedLegality";

/**
 * API endpoint for managing curated legality data.
 * 
 * GET: Returns all curated legality data
 * POST: Updates curated legality data for one or more rares
 * DELETE: Removes curated data for a specific rare
 * 
 * IMPORTANT: Only available in development mode for security.
 */
export const prerender = false;

/**
 * Check if the request is in development mode
 */
function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

export const GET: APIRoute = async () => {
  if (!isDevelopment()) {
    return new Response(
      JSON.stringify({ 
        error: "Curation API is only available in development mode" 
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const data = await loadCuratedLegality();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading curated legality:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load curated data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!isDevelopment()) {
    return new Response(
      JSON.stringify({ 
        error: "Curation API is only available in development mode" 
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { rareName, data: updateData } = body;

    if (!rareName) {
      return new Response(
        JSON.stringify({ error: "rareName is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load existing data
    const curated = await loadCuratedLegality();

    // Update or add the rare's data
    curated[rareName] = {
      illegalInSuperpowers: updateData.illegalInSuperpowers ?? [],
      illegalInGovs: updateData.illegalInGovs ?? [],
      illegalInSuperpowerGovs: updateData.illegalInSuperpowerGovs ?? [],
    };

    // Save to disk
    await saveCuratedLegality(curated);

    return new Response(
      JSON.stringify({ success: true, rareName, data: curated[rareName] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving curated legality:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save curated data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!isDevelopment()) {
    return new Response(
      JSON.stringify({ 
        error: "Curation API is only available in development mode" 
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { rareName } = body;

    if (!rareName) {
      return new Response(
        JSON.stringify({ error: "rareName is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load existing data
    const curated = await loadCuratedLegality();

    // Remove the rare's data
    delete curated[rareName];

    // Save to disk
    await saveCuratedLegality(curated);

    return new Response(
      JSON.stringify({ success: true, rareName, message: "Deleted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting curated legality:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete curated data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
