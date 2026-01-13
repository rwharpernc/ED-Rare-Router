import type { APIRoute } from "astro";
import {
  loadCuratedPrices,
  saveCuratedPrices,
  type CuratedPriceData,
} from "../../lib/curatedPrices";

/**
 * API endpoint for managing curated price data.
 * 
 * GET: Returns all curated price data
 * POST: Updates curated price data for one or more rares
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
    const data = await loadCuratedPrices();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading curated prices:", error);
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

    // Validate cost is a number if provided
    if (updateData.cost !== undefined && (typeof updateData.cost !== "number" || updateData.cost < 0)) {
      return new Response(
        JSON.stringify({ error: "cost must be a non-negative number" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Load existing data
    const curated = await loadCuratedPrices();

    // Update or add the rare's data
    curated[rareName] = {
      cost: updateData.cost !== undefined ? updateData.cost : undefined,
    };

    // Remove entry if cost is undefined/null (cleanup)
    if (curated[rareName].cost === undefined || curated[rareName].cost === null) {
      delete curated[rareName];
    } else {
      // Save to disk
      await saveCuratedPrices(curated);
    }

    return new Response(
      JSON.stringify({ success: true, rareName, data: curated[rareName] || null }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving curated prices:", error);
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
    const curated = await loadCuratedPrices();

    // Remove the rare's data
    delete curated[rareName];

    // Save to disk
    await saveCuratedPrices(curated);

    return new Response(
      JSON.stringify({ success: true, rareName, message: "Deleted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting curated prices:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete curated data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
